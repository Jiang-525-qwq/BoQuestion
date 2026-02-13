import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import StorageService from '../services/StorageService';

const BankDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { bankId, bankName } = route.params || {};
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bankInfo, setBankInfo] = useState({});

  // 加载题库信息和题目
  const loadData = async () => {
    setLoading(true);
    try {
      // 获取题库信息
      const data = await StorageService.getAllQuestionBanks();
      const bank = data.questionBanks.find(b => b.id === bankId);
      if (bank) {
        setBankInfo(bank);
        setQuestions(bank.questions || []);
      }
    } catch (error) {
      Alert.alert('错误', '加载题目失败');
      console.error('加载题目失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [bankId]);

  // 删除题目
  const handleDeleteQuestion = (question) => {
    Alert.alert(
      '确认删除',
      `确定要删除题目 "${question.title.substring(0, 30)}..." 吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteQuestionFromBank(bankId, question.id);
              loadData();
            } catch (error) {
              Alert.alert('错误', '删除题目失败');
              console.error('删除题目失败:', error);
            }
          },
        },
      ]
    );
  };

  // 开始练习
  const handleStartQuiz = () => {
    if (questions.length === 0) {
      Alert.alert('提示', '当前题库没有题目，请先添加题目');
      return;
    }
    navigation.navigate('Quiz', { 
      questions,
      bankName 
    });
  };

  // 添加新题目
  const handleAddQuestion = () => {
    navigation.navigate('EditQuestion', { 
      bankId,
      questionId: null // null 表示新增
    });
  };

  // 编辑题目
  const handleEditQuestion = (question) => {
    navigation.navigate('EditQuestion', { 
      bankId,
      questionId: question.id
    });
  };

  // 渲染题目项
  const renderQuestionItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.questionItem}
      onPress={() => handleEditQuestion(item)}
      onLongPress={() => handleDeleteQuestion(item)}
    >
      <View style={styles.questionHeader}>
        <Text style={styles.questionIndex}>Q{index + 1}</Text>
        <Text style={styles.questionType}>
          {item.type === 'singleChoice' ? '单选题' :
           item.type === 'multipleChoice' ? '多选题' :
           item.type === 'fillBlank' ? '填空题' : '简答题'}
        </Text>
      </View>
      
      <Text style={styles.questionTitle} numberOfLines={2}>
        {item.title}
      </Text>
      
      <View style={styles.questionFooter}>
        <Text style={styles.answerHint}>
          答案: {item.answer?.substring(0, 20) || '未设置'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 标题栏 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {bankName || '题库详情'}
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* 题库信息 */}
      <View style={styles.bankInfoCard}>
        <Text style={styles.bankName}>{bankInfo.name}</Text>
        <Text style={styles.bankDescription}>
          {bankInfo.description || '暂无描述'}
        </Text>
        <View style={styles.bankStats}>
          <Text style={styles.statItem}>
            题目总数: <Text style={styles.statValue}>{questions.length}</Text>
          </Text>
          <Text style={styles.statItem}>
            最后更新: <Text style={styles.statValue}>
              {new Date(bankInfo.updatedAt).toLocaleDateString()}
            </Text>
          </Text>
        </View>
      </View>

      {/* 操作按钮 */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.quizButton]}
          onPress={handleStartQuiz}
        >
          <Text style={styles.quizButtonText}>开始练习</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.addButton]}
          onPress={handleAddQuestion}
        >
          <Text style={styles.addButtonText}>+ 添加题目</Text>
        </TouchableOpacity>
      </View>

      {/* 题目列表 */}
      <View style={styles.questionListHeader}>
        <Text style={styles.questionListTitle}>题目列表</Text>
        <Text style={styles.questionCountText}>
          共 {questions.length} 题
        </Text>
      </View>

      {questions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>暂无题目</Text>
          <Text style={styles.emptyHint}>点击"添加题目"按钮创建第一道题目</Text>
        </View>
      ) : (
        <FlatList
          data={questions}
          renderItem={renderQuestionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#5189b7',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerRight: {
    width: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankInfoCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bankName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  bankDescription: {
    fontSize: 15,
    color: '#666',
    marginBottom: 16,
    lineHeight: 22,
  },
  bankStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  statItem: {
    fontSize: 14,
    color: '#888',
  },
  statValue: {
    color: '#5189b7',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizButton: {
    backgroundColor: '#628f64',
  },
  addButton: {
    backgroundColor: '#5189b7',
  },
  quizButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  questionListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  questionListTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  questionCountText: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  questionItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionIndex: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5189b7',
  },
  questionType: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  questionTitle: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 8,
  },
  questionFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
    paddingTop: 8,
  },
  answerHint: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
  },
});

export default BankDetailScreen;