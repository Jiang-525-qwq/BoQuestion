import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import StorageService from '../services/StorageService';

const QuestionBankScreen = () => {
  const navigation = useNavigation();
  const [questionBanks, setQuestionBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 创建题库的模态框状态
  const [modalVisible, setModalVisible] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [newBankDescription, setNewBankDescription] = useState('');

  // 加载题库列表
  const loadQuestionBanks = async () => {
    setLoading(true);
    try {
      const data = await StorageService.getAllQuestionBanks();
      setQuestionBanks(data.questionBanks || []);
    } catch (error) {
      Alert.alert('错误', '加载题库失败');
      console.error('加载题库失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 每次进入页面都刷新
  useFocusEffect(
    React.useCallback(() => {
      loadQuestionBanks();
      return () => {};
    }, [])
  );

  // 创建新题库
  const handleCreateBank = async () => {
    if (!newBankName.trim()) {
      Alert.alert('提示', '请输入题库名称');
      return;
    }

    try {
      await StorageService.createQuestionBank({
        name: newBankName.trim(),
        description: newBankDescription.trim(),
      });
      
      setNewBankName('');
      setNewBankDescription('');
      setModalVisible(false);
      loadQuestionBanks();
      
      Alert.alert('成功', '题库创建成功');
    } catch (error) {
      Alert.alert('错误', '创建题库失败');
      console.error('创建题库失败:', error);
    }
  };

  // 删除题库
  const handleDeleteBank = (bank) => {
    if (bank.isDefault) {
      Alert.alert('提示', '默认题库不能删除');
      return;
    }

    Alert.alert(
      '确认删除',
      `确定要删除题库 "${bank.name}" 吗？\n此操作将删除题库内的所有题目，且不可恢复。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteQuestionBank(bank.id);
              loadQuestionBanks();
            } catch (error) {
              Alert.alert('错误', '删除题库失败');
              console.error('删除题库失败:', error);
            }
          },
        },
      ]
    );
  };

  // 进入题库（查看题目或开始练习）
  const handleEnterBank = (bank) => {
    navigation.navigate('BankDetail', { 
      bankId: bank.id,
      bankName: bank.name 
    });
  };

  // 渲染每个题库项
  const renderBankItem = ({ item }) => (
    <TouchableOpacity
      style={styles.bankItem}
      onPress={() => handleEnterBank(item)}
      onLongPress={() => handleDeleteBank(item)}
    >
      <View style={styles.bankHeader}>
        <Text style={styles.bankName}>{item.name}</Text>
        {item.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>默认</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.bankDescription} numberOfLines={2}>
        {item.description || '暂无描述'}
      </Text>
      
      <View style={styles.bankFooter}>
        <Text style={styles.questionCount}>
          题目数量: {item.questions?.length || 0}
        </Text>
        <Text style={styles.updateTime}>
          更新: {new Date(item.updatedAt).toLocaleDateString()}
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
        <Text style={styles.headerTitle}>我的题库</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.createButtonText}>+ 新建题库</Text>
        </TouchableOpacity>
      </View>

      {/* 题库列表 */}
      {questionBanks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>暂无题库</Text>
          <Text style={styles.emptyHint}>点击右上角按钮创建第一个题库</Text>
        </View>
      ) : (
        <FlatList
          data={questionBanks}
          renderItem={renderBankItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* 使用提示 */}
      <View style={styles.hintContainer}>
        <Text style={styles.hintText}>
          • 点击题库进入题目管理
        </Text>
        <Text style={styles.hintText}>
          • 长按题库可删除（默认题库除外）
        </Text>
      </View>

      {/* 创建题库模态框 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>创建新题库</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="题库名称 *"
              placeholderTextColor="#999"
              value={newBankName}
              onChangeText={setNewBankName}
              autoFocus={true}
            />
            
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="题库描述（可选）"
              placeholderTextColor="#999"
              value={newBankDescription}
              onChangeText={setNewBankDescription}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCreateBank}
              >
                <Text style={styles.confirmButtonText}>创建</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    backgroundColor: '#5189b7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 16,
  },
  bankItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bankName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  defaultBadge: {
    backgroundColor: '#608d61',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  defaultBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  bankDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  bankFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionCount: {
    fontSize: 13,
    color: '#5189b7',
    fontWeight: '500',
  },
  updateTime: {
    fontSize: 12,
    color: '#999',
  },
  hintContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  hintText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
  },
  modalTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  confirmButton: {
    backgroundColor: '#5189b7',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QuestionBankScreen;