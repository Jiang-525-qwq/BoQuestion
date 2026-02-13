import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import StorageService from '../services/StorageService';

const EditQuestionScreen = ({ route, navigation }) => {
  const { bankId, questionId } = route.params || {};
  
  // 如果只传递了 questionId，设置默认 bankId
  const effectiveBankId = bankId || 'default_bank';
  // 状态管理
  const [title, setTitle] = useState('');
  const [type, setType] = useState('singleChoice'); // 题型：singleChoice | multipleChoice | fillBlank | shortAnswer
  const [options, setOptions] = useState(['', '', '', '']); // 选择题选项（最多4个）
  const [answer, setAnswer] = useState('');
  const [analysis, setAnalysis] = useState('');

  // 如果是编辑模式，加载已有题目数据
  useEffect(() => {
    if (questionId) {
      loadQuestion();
    }
  }, [questionId]);

  // 加载题目数据
  const loadQuestion = async () => {
    try {
      const questions = await StorageService.getQuestionsByBankId(bankId);
    const question = questions.find(q => q.id === questionId);
      if (question) {
        setTitle(question.title || '');
        setType(question.type || 'singleChoice');
        setOptions(question.options || ['', '', '', '']);
        setAnswer(question.answer || '');
        setAnalysis(question.analysis || '');
      }
    } catch (error) {
      Alert.alert('错误', '加载题目失败');
      console.error('加载题目失败:', error);
    }
  };

  // 处理选项文本变化
  const handleOptionChange = (text, index) => {
    const newOptions = [...options];
    newOptions[index] = text;
    setOptions(newOptions);
  };

  // 保存题目（新增或更新） - 修复答案格式转换
  const handleSave = async () => {
    // 基础验证
    if (!title.trim()) {
      Alert.alert('提示', '请输入题干内容');
      return;
    }

    // 对选择题进行特殊处理：答案转换和选项过滤
    let processedAnswer = answer.trim();
    let processedOptions = [];
    
    if (type === 'singleChoice' || type === 'multipleChoice') {
      // 将字母答案转换为数字索引（A->0, B->1, C->2, D->3）
      if (/^[A-D]$/i.test(processedAnswer)) {
        const letter = processedAnswer.toUpperCase();
        processedAnswer = (letter.charCodeAt(0) - 65).toString(); // A->0, B->1
      }
      
      // 过滤掉空选项
      processedOptions = options.filter(opt => opt.trim() !== '');
      
      // 如果是单选题，验证答案是否在有效范围内
      if (type === 'singleChoice') {
        const answerNum = parseInt(processedAnswer, 10);
        if (isNaN(answerNum) || answerNum < 0 || answerNum >= processedOptions.length) {
          Alert.alert('错误', '请选择有效的正确答案（选项字母或数字索引）');
          return;
        }
      }
    }

    // 构建题目对象
    const questionToSave = {
      id: questionId || undefined, // 新增时无id，由StorageService生成
      title: title.trim(),
      type,
      options: processedOptions,
      answer: processedAnswer,
      analysis: analysis.trim(),
      updatedAt: new Date().toISOString(),
    };

    console.log('保存的题目对象:', questionToSave);

    try {
      await StorageService.saveQuestionToBank(bankId, questionToSave);
      Alert.alert(
        '成功',
        questionId ? '题目已更新' : '题目已添加',
        [
          { 
            text: '确定', 
            onPress: () => navigation.goBack() 
          }
        ]
      );
    } catch (error) {
      Alert.alert('错误', '保存失败，请重试');
      console.error('保存题目失败:', error);
    }
  };

  // 题型选择按钮
  const typeButtons = [
    { key: 'singleChoice', label: '单选题' },
    { key: 'multipleChoice', label: '多选题' },
    { key: 'fillBlank', label: '填空题' },
    { key: 'shortAnswer', label: '简答题' },
  ];

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      {/* 题型选择 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>题型选择</Text>
        <View style={styles.typeButtonContainer}>
          {typeButtons.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.typeButton,
                type === item.key && styles.typeButtonActive
              ]}
              onPress={() => setType(item.key)}
            >
              <Text style={[
                styles.typeButtonText,
                type === item.key && styles.typeButtonTextActive
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 题干输入 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          题干内容 <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={4}
          placeholder="请输入题目内容..."
          placeholderTextColor="#999"
          value={title}
          onChangeText={setTitle}
        />
      </View>

      {/* 选项输入（仅选择题显示） */}
      {(type === 'singleChoice' || type === 'multipleChoice') && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>选项设置</Text>
          {options.map((option, index) => (
            <View key={index} style={styles.optionRow}>
              <Text style={styles.optionLabel}>
                {String.fromCharCode(65 + index)}.
              </Text>
              <TextInput
                style={[styles.input, styles.optionInput]}
                placeholder={`请输入选项${String.fromCharCode(65 + index)}`}
                placeholderTextColor="#999"
                value={option}
                onChangeText={(text) => handleOptionChange(text, index)}
              />
            </View>
          ))}
          <Text style={styles.optionHint}>
            提示：留空的选项将不会被保存
          </Text>
          <Text style={styles.answerHint}>
            正确答案请输入选项字母（如：A）或数字索引（如：0）
          </Text>
        </View>
      )}

      {/* 答案输入 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {type === 'singleChoice' ? '正确答案' : 
           type === 'multipleChoice' ? '正确答案（多个用逗号分隔）' : 
           type === 'fillBlank' ? '填空答案' : '参考答案'}
        </Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={3}
          placeholder={
            type === 'singleChoice' ? '请输入正确选项字母（如：A）或数字（如：0）' :
            type === 'multipleChoice' ? '请输入正确选项字母（如：A,C,D）' :
            type === 'fillBlank' ? '请输入填空处的正确答案' :
            '请输入参考答案或评分要点'
          }
          placeholderTextColor="#999"
          value={answer}
          onChangeText={setAnswer}
        />
      </View>

      {/* 解析输入 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>题目解析</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={4}
          placeholder="请输入题目解析或知识点说明（可选）"
          placeholderTextColor="#999"
          value={analysis}
          onChangeText={setAnalysis}
        />
      </View>

      {/* 操作按钮 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>取消</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>
            {questionId ? '更新题目' : '添加题目'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// 样式定义
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  required: {
    color: '#91322d',
  },
  typeButtonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f1f3f5',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  typeButtonActive: {
    backgroundColor: '#5189b7',
    borderColor: '#5189b7',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#495057',
  },
  typeButtonTextActive: {
    color: 'white',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionLabel: {
    width: 30,
    fontSize: 16,
    fontWeight: '500',
    color: '#495057',
  },
  optionInput: {
    flex: 1,
    marginLeft: 8,
  },
  optionHint: {
    fontSize: 12,
    color: '#868e96',
    marginTop: 8,
    fontStyle: 'italic',
  },
  answerHint: {
    fontSize: 12,
    color: '#5189b7',
    marginTop: 4,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 30,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#5189b7',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#495057',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditQuestionScreen;