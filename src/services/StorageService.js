import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@MyQuestionBanks_v2';

const StorageService = {
  // ========== 题库管理 ==========
  
  // 获取所有题库
  async getAllQuestionBanks() {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue != null) {
        return JSON.parse(jsonValue);
      }
      // 首次使用：创建默认题库
      return await this.createDefaultQuestionBanks();
    } catch (e) {
      console.error('Failed to load question banks.', e);
      return { questionBanks: [] };
    }
  },

  // 创建默认题库（首次使用）
  async createDefaultQuestionBanks() {
    const defaultBanks = {
      questionBanks: [
        {
          id: 'default_bank',
          name: '默认题库',
          description: '系统默认题库',
          questions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDefault: true
        }
      ]
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultBanks));
    return defaultBanks;
  },

  // 创建新题库
  async createQuestionBank(bankData) {
    try {
      const data = await this.getAllQuestionBanks();
      const newBank = {
        id: `bank_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: bankData.name || '未命名题库',
        description: bankData.description || '',
        questions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDefault: false
      };
      
      data.questionBanks.push(newBank);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return newBank;
    } catch (e) {
      console.error('Failed to create question bank.', e);
      throw e;
    }
  },

  // 更新题库信息（不包含题目）
  async updateQuestionBank(bankId, updateData) {
    try {
      const data = await this.getAllQuestionBanks();
      const bankIndex = data.questionBanks.findIndex(bank => bank.id === bankId);
      
      if (bankIndex === -1) {
        throw new Error('题库不存在');
      }
      
      data.questionBanks[bankIndex] = {
        ...data.questionBanks[bankIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data.questionBanks[bankIndex];
    } catch (e) {
      console.error('Failed to update question bank.', e);
      throw e;
    }
  },

  // 删除题库
  async deleteQuestionBank(bankId) {
    try {
      const data = await this.getAllQuestionBanks();
      // 不允许删除默认题库
      if (data.questionBanks.find(bank => bank.id === bankId)?.isDefault) {
        throw new Error('不能删除默认题库');
      }
      
      data.questionBanks = data.questionBanks.filter(bank => bank.id !== bankId);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to delete question bank.', e);
      throw e;
    }
  },

  // ========== 题目管理（需要指定题库ID） ==========
  
  // 获取指定题库的所有题目
  async getQuestionsByBankId(bankId) {
    try {
      const data = await this.getAllQuestionBanks();
      const bank = data.questionBanks.find(bank => bank.id === bankId);
      return bank ? bank.questions : [];
    } catch (e) {
      console.error('Failed to load questions by bank.', e);
      return [];
    }
  },

  // 在指定题库中保存题目
  async saveQuestionToBank(bankId, question) {
    try {
      const data = await this.getAllQuestionBanks();
      const bankIndex = data.questionBanks.findIndex(bank => bank.id === bankId);
      
      if (bankIndex === -1) {
        throw new Error('题库不存在');
      }
      
      const bank = data.questionBanks[bankIndex];
      const questions = bank.questions || [];
      
      if (question.id) {
        // 更新：找到并替换
        const questionIndex = questions.findIndex(q => q.id === question.id);
        if (questionIndex > -1) {
          questions[questionIndex] = question;
        } else {
          questions.push(question);
        }
      } else {
        // 新增：生成ID并添加
        question.id = `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        question.createdAt = new Date().toISOString();
        questions.push(question);
      }
      
      // 更新题库
      data.questionBanks[bankIndex].questions = questions;
      data.questionBanks[bankIndex].updatedAt = new Date().toISOString();
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return question;
    } catch (e) {
      console.error('Failed to save question to bank.', e);
      throw e;
    }
  },

  // 从指定题库删除题目
  async deleteQuestionFromBank(bankId, questionId) {
    try {
      const data = await this.getAllQuestionBanks();
      const bankIndex = data.questionBanks.findIndex(bank => bank.id === bankId);
      
      if (bankIndex === -1) {
        throw new Error('题库不存在');
      }
      
      const bank = data.questionBanks[bankIndex];
      bank.questions = bank.questions.filter(q => q.id !== questionId);
      bank.updatedAt = new Date().toISOString();
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to delete question from bank.', e);
      throw e;
    }
  },

  // ========== 数据迁移（从旧版本升级） ==========
  
  async migrateFromV1() {
    try {
      const oldKey = '@MyQuestionBank_v1';
      const oldData = await AsyncStorage.getItem(oldKey);
      
      if (oldData) {
        const oldQuestions = JSON.parse(oldData);
        const data = await this.getAllQuestionBanks();
        
        // 将旧题目迁移到默认题库
        const defaultBankIndex = data.questionBanks.findIndex(bank => bank.isDefault);
        if (defaultBankIndex !== -1 && oldQuestions.length > 0) {
          data.questionBanks[defaultBankIndex].questions = oldQuestions;
          data.questionBanks[defaultBankIndex].updatedAt = new Date().toISOString();
          
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          await AsyncStorage.removeItem(oldKey); // 删除旧数据
          
          console.log(`成功迁移 ${oldQuestions.length} 道题目到默认题库`);
        }
      }
    } catch (e) {
      console.error('数据迁移失败:', e);
    }
  },

  // ========== 工具函数 ==========
  
  // 清空所有数据（调试用）
  async clearAll() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear storage.', e);
    }
  },
};

// 应用启动时自动执行数据迁移
StorageService.migrateFromV1();

export default StorageService;