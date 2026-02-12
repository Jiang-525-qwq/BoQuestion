import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@MyQuestionBank_v1';

const StorageService = {
  // 获取所有题目
  async getAllQuestions() {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error('Failed to load questions.', e);
      return [];
    }
  },

  // 保存单个题目（新增或更新）
  async saveQuestion(question) {
    try {
      const questions = await this.getAllQuestions();
      if (question.id) {
        // 更新：找到并替换
        const index = questions.findIndex(q => q.id === question.id);
        if (index > -1) {
          questions[index] = question;
        } else {
          questions.push(question);
        }
      } else {
        // 新增：生成ID并添加
        question.id = Date.now().toString();
        question.createdAt = new Date().toISOString();
        questions.push(question);
      }
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
      return question;
    } catch (e) {
      console.error('Failed to save question.', e);
      throw e;
    }
  },

  // 删除题目
  async deleteQuestion(id) {
    try {
      let questions = await this.getAllQuestions();
      questions = questions.filter(q => q.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
    } catch (e) {
      console.error('Failed to delete question.', e);
      throw e;
    }
  },

  // 清空所有题目（调试用）
  async clearAll() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear storage.', e);
    }
  },
};

export default StorageService;