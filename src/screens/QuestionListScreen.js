import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import StorageService from '../services/StorageService';

const QuestionListScreen = ({ navigation }) => {
  const [questions, setQuestions] = useState([]);

  // 设置导航栏右侧按钮
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={handleStartQuiz}
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>开始练习</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, questions]); // 依赖questions，以便在题目变化时更新

  const loadQuestions = async () => {
    const loadedQuestions = await StorageService.getAllQuestions();
    setQuestions(loadedQuestions);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadQuestions);
    return unsubscribe;
  }, [navigation]);

  const handleStartQuiz = () => {
    if (questions.length === 0) {
      Alert.alert('提示', '题库为空，请先添加题目');
      return;
    }
    
    // 跳转到练习页面，传递题目数据
    navigation.navigate('Quiz', { 
      questions: questions 
    });
  };

  const handleDelete = (id, title) => {
    Alert.alert(
      '确认删除',
      `确定要删除题目："${title.substring(0, 20)}..."吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            await StorageService.deleteQuestion(id);
            loadQuestions();
          },
        },
      ]
    );
  };

  const renderQuestionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() =>
        navigation.navigate('EditQuestion', { questionId: item.id })
      }
    >
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {item.title || '无题干'}
        </Text>
        <Text style={styles.itemType}>
          {item.type === 'singleChoice' ? '单选题' : 
           item.type === 'multipleChoice' ? '多选题' : 
           item.type === 'fillBlank' ? '填空题' : '简答题'}
        </Text>
        {item.category && (
          <Text style={styles.itemCategory}>{item.category}</Text>
        )}
      </View>
      <TouchableOpacity
        onPress={() => handleDelete(item.id, item.title)}
        style={styles.deleteButton}
      >
        <Text style={styles.deleteText}>删除</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={questions}
        renderItem={renderQuestionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={questions.length === 0 && styles.emptyList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              题库为空，点击下方按钮添加题目
            </Text>
          </View>
        }
      />
      
      {/* 右下角的添加题目按钮保持不变 */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('EditQuestion', { questionId: null })}
      >
        <Text style={styles.fabText}>+ 添加题目</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  
  // 导航栏右上角按钮样式
  headerButton: {
    marginRight: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#587955', 
    borderRadius: 6,
  },
  headerButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // 列表项样式
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  itemContent: { 
    flex: 1 
  },
  itemTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginBottom: 4,
    color: '#333',
  },
  itemType: { 
    fontSize: 12, 
    color: '#666',
    marginBottom: 2,
  },
  itemCategory: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
  deleteButton: { 
    padding: 8 
  },
  deleteText: { 
    color: 'red', 
    fontSize: 14 
  },
  
  // 空状态样式
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyContainer: { 
    alignItems: 'center', 
    marginTop: 100 
  },
  emptyText: { 
    fontSize: 16, 
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  
  // 右下角浮动按钮
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#4d7eb1',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
});

export default QuestionListScreen;