import { Redirect } from 'expo-router';
import { usePasscodeStore } from '@/store/passcodeStore';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/colors';

export default function Index() {
  const { passcode, isLoading } = usePasscodeStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white }}>
        <ActivityIndicator color={Colors.blue} size="large" />
      </View>
    );
  }

  return <Redirect href={passcode ? '/(tabs)/home' : '/(auth)/login'} />;
}
