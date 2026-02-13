// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './src/navigation/types'; // 导入类型定义

// 导入页面组件
import QuestionBankScreen from './src/screens/QuestionBankScreen';
import BankDetailScreen from './src/screens/BankDetailScreen';
import EditQuestionScreen from './src/screens/EditQuestionScreen.js';
import QuizScreen from './src/screens/QuizScreen';

// 使用定义的类型创建Stack导航器
const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="QuestionBank"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#333',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        {/* 题库列表页 */}
        <Stack.Screen 
          name="QuestionBank" 
          component={QuestionBankScreen}
          options={{ 
            title: '我的题库',
            headerBackTitle: '返回'
          }}
        />
        
        {/* 题库详情页 */}
        <Stack.Screen 
          name="BankDetail" 
          component={BankDetailScreen}
          options={({ route }) => ({ 
            title: route.params.bankName || '题库详情',
            headerBackTitle: '返回'
          })}
        />
        
        {/* 编辑题目页 */}
        <Stack.Screen 
          name="EditQuestion" 
          component={EditQuestionScreen}
          options={({ route }) => ({ 
            title: route.params.questionId ? '编辑题目' : '添加题目',
            headerBackTitle: '返回'
          })}
        />
        
        {/* 答题页 */}
        <Stack.Screen 
          name="Quiz" 
          component={QuizScreen}
          options={({ route }) => ({ 
            title: route.params.bankName ? `${route.params.bankName} - 练习` : '开始练习',
            headerBackTitle: '返回'
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;