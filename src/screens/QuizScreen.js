import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';

const QuizScreen = ({ route, navigation }) => {
  // 从路由参数获取题目列表
  const { questions = [] } = route.params || {};
  
  // 调试输出
  console.log('QuizScreen接收到的题目数量:', questions.length);
  if (questions.length > 0) {
    console.log('第一题详情:', questions[0]);
  }
  
  // 状态管理
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // 获取当前题目
  const currentQuestion = questions[currentQuestionIndex] || {};
  
  // 调试：打印当前题目的详细信息
  useEffect(() => {
    if (currentQuestion && Object.keys(currentQuestion).length > 0) {
      console.log('当前题目索引:', currentQuestionIndex);
      console.log('当前题目对象:', currentQuestion);
      console.log('题目标题:', currentQuestion.title);
      console.log('题目选项:', currentQuestion.options);
      console.log('正确答案:', currentQuestion.answer);
      console.log('正确答案类型:', typeof currentQuestion.answer);
    }
  }, [currentQuestion, currentQuestionIndex]);
  
  // 获取题目文本（兼容多种字段名）
  const getQuestionText = () => {
    const q = currentQuestion;
    return q?.title || q?.question || q?.content || '题目内容未定义';
  };
  
  // 获取选项（兼容多种字段名）
  const getOptions = () => {
    const q = currentQuestion;
    return q?.options || q?.choices || q?.selections || [];
  };
  
  // 获取正确答案索引（处理各种格式）
  const getCorrectAnswerIndex = () => {
    const correctAnswer = currentQuestion.answer;
    
    if (correctAnswer === undefined || correctAnswer === null || correctAnswer === '') {
      console.log('未设置正确答案');
      return -1;
    }
    
    console.log('原始正确答案:', correctAnswer, '类型:', typeof correctAnswer);
    
    // 如果是数字
    if (typeof correctAnswer === 'number') {
      console.log('正确答案是数字:', correctAnswer);
      return correctAnswer;
    }
    
    // 如果是数字字符串
    if (typeof correctAnswer === 'string' && /^\d+$/.test(correctAnswer)) {
      const num = parseInt(correctAnswer, 10);
      console.log('正确答案是数字字符串:', correctAnswer, '转换为:', num);
      return num;
    }
    
    // 如果是字母（A, B, C, D）
    if (typeof correctAnswer === 'string' && /^[A-D]$/i.test(correctAnswer)) {
      const index = correctAnswer.toUpperCase().charCodeAt(0) - 65; // A->0, B->1
      console.log('正确答案是字母:', correctAnswer, '转换为索引:', index);
      return index;
    }
    
    // 如果是字母字符串但包含空格等
    if (typeof correctAnswer === 'string') {
      const trimmed = correctAnswer.trim().toUpperCase();
      if (/^[A-D]$/.test(trimmed)) {
        const index = trimmed.charCodeAt(0) - 65;
        console.log('清理后的字母答案:', trimmed, '转换为索引:', index);
        return index;
      }
    }
    
    console.log('无法识别的正确答案格式:', correctAnswer);
    return -1;
  };
  
  // 检查用户答案是否正确
  const checkAnswer = (selectedIndex) => {
    const correctIndex = getCorrectAnswerIndex();
    console.log('用户选择:', selectedIndex, '正确答案索引:', correctIndex);
    
    if (correctIndex === -1) {
      console.log('未设置正确答案，无法判断');
      return false;
    }
    
    return selectedIndex === correctIndex;
  };
  
  // 处理选项选择
  const handleOptionSelect = (optionIndex) => {
    if (isAnswerSubmitted) return; // 已经提交过答案，不能再选择
    
    console.log('用户选择了选项:', optionIndex);
    setSelectedOption(optionIndex);
  };
  
  // 提交答案并进入下一题
  const handleSubmit = () => {
    if (selectedOption === null) {
      Alert.alert('提示', '请选择一个答案');
      return;
    }
    
    setLoading(true);
    
    // 检查答案是否正确
    const isCorrect = checkAnswer(selectedOption);
    console.log('答案是否正确:', isCorrect);
    
    // 更新分数
    if (isCorrect) {
      setScore(prevScore => {
        const newScore = prevScore + 1;
        console.log('分数更新: 从', prevScore, '到', newScore);
        return newScore;
      });
    }
    
    setIsAnswerSubmitted(true);
    setLoading(false);
    
    // 1.5秒后进入下一题或结束
    setTimeout(() => {
      setIsAnswerSubmitted(false);
      
      // 判断是否还有下一题
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedOption(null);
      } else {
        // 所有题目完成
        setQuizFinished(true);
        setShowResult(true);
      }
    }, 1500);
  };
  
  // 跳过当前题目
  const handleSkip = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setQuizFinished(true);
      setShowResult(true);
    }
  };
  
  // 重新开始
  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setScore(0);
    setQuizFinished(false);
    setShowResult(false);
    setIsAnswerSubmitted(false);
  };
  
  // 显示加载状态
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>正在提交答案...</Text>
      </SafeAreaView>
    );
  }
  
  // 如果没有题目
  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>暂无题目</Text>
          <Text style={styles.emptyText}>请先添加题目后再开始练习</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>返回题库</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  // 显示结果
  if (showResult) {
    const correctCount = score;
    const totalCount = questions.length;
    const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    
    // 分析表现
    let performanceText = '';
    if (percentage >= 90) performanceText = '优秀！';
    else if (percentage >= 80) performanceText = '良好！';
    else if (percentage >= 60) performanceText = '及格！';
    else performanceText = '需要继续努力！';
    
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.resultContent}>
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>测试完成！</Text>
            <Text style={styles.performanceText}>{performanceText}</Text>
            
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreText}>{correctCount}</Text>
              <Text style={styles.totalText}>/ {totalCount}</Text>
            </View>
            
            <Text style={styles.percentageText}>正确率: {percentage}%</Text>
            
            <View style={styles.resultDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>答对题目:</Text>
                <Text style={styles.detailValue}>{correctCount} 题</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>答错题目:</Text>
                <Text style={styles.detailValue}>{totalCount - correctCount} 题</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>总题目数:</Text>
                <Text style={styles.detailValue}>{totalCount} 题</Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.restartButton}
              onPress={handleRestart}
            >
              <Text style={styles.restartButtonText}>重新开始</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() => {
                Alert.alert('功能开发中', '错题回顾功能即将上线');
              }}
            >
              <Text style={styles.reviewButtonText}>查看错题</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>返回题库</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
  
  // 获取当前题目的选项
  const currentOptions = getOptions();
  const correctAnswerIndex = getCorrectAnswerIndex();
  
  return (
    <SafeAreaView style={styles.container}>
      {/* 顶部进度条和统计信息 */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }
            ]} 
          />
        </View>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            第 {currentQuestionIndex + 1} 题 / 共 {questions.length} 题
          </Text>
          <Text style={styles.scoreInfo}>当前得分: {score}</Text>
        </View>
      </View>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 题目内容 */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionNumber}>题目 {currentQuestionIndex + 1}</Text>
          <Text style={styles.questionText}>{getQuestionText()}</Text>
        </View>
        
        {/* 选项列表 */}
        <View style={styles.optionsContainer}>
          {currentOptions.map((option, index) => {
            let buttonStyle = styles.optionButton;
            let textStyle = styles.optionText;
            
            // 用户已选择该选项
            if (selectedOption === index) {
              buttonStyle = [styles.optionButton, styles.selectedOption];
              textStyle = [styles.optionText, styles.selectedOptionText];
            }
            
            // 答案已提交，显示正确答案
            if (isAnswerSubmitted) {
              if (index === correctAnswerIndex) {
                // 正确答案
                buttonStyle = [styles.optionButton, styles.correctOption];
                textStyle = [styles.optionText, styles.correctOptionText];
              } else if (selectedOption === index && index !== correctAnswerIndex) {
                // 用户选择的错误答案
                buttonStyle = [styles.optionButton, styles.wrongOption];
                textStyle = [styles.optionText, styles.wrongOptionText];
              }
            }
            
            return (
              <TouchableOpacity
                key={index}
                style={buttonStyle}
                onPress={() => handleOptionSelect(index)}
                disabled={isAnswerSubmitted}
              >
                <View style={styles.optionLabel}>
                  <Text style={styles.optionLetter}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text style={textStyle} numberOfLines={2}>{option}</Text>
                {selectedOption === index && !isAnswerSubmitted && (
                  <View style={styles.selectedIndicator}>
                    <Text style={styles.selectedIndicatorText}>✓</Text>
                  </View>
                )}
                {isAnswerSubmitted && index === correctAnswerIndex && (
                  <View style={styles.correctIndicator}>
                    <Text style={styles.correctIndicatorText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        
        {/* 答案解析（提交后显示） */}
        {isAnswerSubmitted && currentQuestion.analysis && (
          <View style={styles.explanationContainer}>
            <Text style={styles.explanationTitle}>答案解析：</Text>
            <Text style={styles.explanationText}>{currentQuestion.analysis}</Text>
          </View>
        )}
        
        {/* 提示信息 */}
        {isAnswerSubmitted && correctAnswerIndex === -1 && (
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              提示：此题未设置正确答案，无法判断对错
            </Text>
          </View>
        )}
      </ScrollView>
      
      {/* 底部操作按钮 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          disabled={isAnswerSubmitted}
        >
          <Text style={styles.skipButtonText}>跳过本题</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.submitButton,
            (selectedOption === null || isAnswerSubmitted) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={selectedOption === null || isAnswerSubmitted}
        >
          <Text style={styles.submitButtonText}>
            {isAnswerSubmitted ? (
              currentQuestionIndex < questions.length - 1 ? '下一题' : '查看结果'
            ) : (
              currentQuestionIndex < questions.length - 1 ? '提交答案' : '完成测试'
            )}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// 样式定义
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  progressContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  scoreInfo: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  questionContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  questionNumber: {
    fontSize: 14,
    color: '#2196F3',
    marginBottom: 8,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 18,
    color: '#333',
    lineHeight: 26,
    fontWeight: '500',
  },
  debugContainer: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 60,
  },
  optionLabel: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionLetter: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  selectedOption: {
    borderColor: '#2196F3',
    backgroundColor: '#e3f2fd',
  },
  selectedOptionText: {
    color: '#2196F3',
    fontWeight: '500',
  },
  correctOption: {
    borderColor: '#4CAF50',
    backgroundColor: '#e8f5e9',
  },
  correctOptionText: {
    color: '#2e7d32',
    fontWeight: '500',
  },
  wrongOption: {
    borderColor: '#f44336',
    backgroundColor: '#ffebee',
  },
  wrongOptionText: {
    color: '#c62828',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  selectedIndicatorText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  correctIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  correctIndicatorText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  explanationContainer: {
    backgroundColor: '#e8f5e9',
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
  },
  explanationTitle: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '600',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  warningContainer: {
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ffb74d',
  },
  warningText: {
    fontSize: 14,
    color: '#ef6c00',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  skipButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  submitButton: {
    flex: 2,
    padding: 15,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#bbdefb',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  resultContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  resultContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  performanceText: {
    fontSize: 20,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 30,
  },
  scoreCircle: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  totalText: {
    fontSize: 32,
    color: '#666',
    marginLeft: 4,
  },
  percentageText: {
    fontSize: 24,
    color: '#666',
    marginBottom: 30,
  },
  resultDetails: {
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  restartButton: {
    width: '100%',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  restartButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  reviewButton: {
    width: '100%',
    backgroundColor: '#ff9800',
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  reviewButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  backButton: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
  },
});

export default QuizScreen;