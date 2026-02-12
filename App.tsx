// App.js - 应用主入口文件
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// 导入您创建的屏幕组件
import QuestionListScreen from './src/screens/QuestionListScreen';
import EditQuestionScreen from './src/screens/EditQuestionScreen';
import QuizScreen from './src/screens/QuizScreen.js';


// 创建导航栈
const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="QuestionList">
        <Stack.Screen 
          name="QuestionList" 
          component={QuestionListScreen}
          options={{ title: '我的题库' }}
        />
        <Stack.Screen 
  name="Quiz" 
  component={QuizScreen}
  options={{ title: '开始练习' }}
/>
        <Stack.Screen 
          name="EditQuestion" 
          component={EditQuestionScreen}
          options={{ title: '编辑题目' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;