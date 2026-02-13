// src/navigation/types.ts
export type RootStackParamList = {
  // 题库列表页 - 无参数
  QuestionBank: undefined;
  
  // 题库详情页 - 接收题库ID和名称
  BankDetail: {
    bankId: string;
    bankName: string;
  };
  
  // 编辑题目页 - 接收题库ID和题目ID（题目ID为可选，null表示新增）
  EditQuestion: {
    bankId: string;
    questionId?: string | null;
  };
  
  // 答题页 - 接收题目列表和题库名称
  Quiz: {
    questions: any[]; // 您可以根据题目对象的实际结构定义更具体的类型
    bankName?: string;
  };
};

// 声明全局的React Navigation类型
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}