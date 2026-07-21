import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/App/HomeScreen';
import AddImpulseScreen from '../screens/App/AddImpulseScreen';
import HistoryScreen from '../screens/App/HistoryScreen';
import ImpulseDetailScreen from '../screens/App/ImpulseDetailScreen';
import { ImpulseItem } from '../store/slices/impulseSlice';
import theme from '../components/common/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

export type HomeStackParamList = {
  HomeList: undefined;
  ImpulseDetail: { impulse: ImpulseItem };
};

const HomeStack = createNativeStackNavigator<HomeStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.background.bgBase,
        },
        headerTintColor: theme.text.textPrimary,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: theme.fontSize.large,
        },
        headerShadowVisible: false,
      }}
    >
      <HomeStack.Screen
        name="HomeList"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="ImpulseDetail"
        component={ImpulseDetailScreen}
        options={{ title: 'Impulse Detail' }}
      />
    </HomeStack.Navigator>
  );
}

export type AppTabParamList = {
  Home: undefined;
  AddImpulse: undefined;
  History: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: theme.background.bgBase,
        },
        headerTintColor: theme.text.textPrimary,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: theme.fontSize.large,
        },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: theme.background.bgSurface,
          borderTopColor: theme.background.bgElevated,
          borderTopWidth: 1,
          paddingTop: 6,
          paddingBottom: 6,
          height: 60,
        },
        tabBarActiveTintColor: theme.brand.primary,
        tabBarInactiveTintColor: theme.text.textTertiary,
        tabBarLabelStyle: {
          fontSize: theme.fontSize.small,
          fontWeight: '500',
        },
        tabBarIcon: ({ color, size }) => {
          let iconName = 'help-outline';

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'AddImpulse') {
            iconName = 'add';
          } else if (route.name === 'History') {
            iconName = 'history';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          headerShown: false,
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="AddImpulse"
        component={AddImpulseScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Add',
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'History',
        }}
      />
    </Tab.Navigator>
  );
}

export default AppTabs;
