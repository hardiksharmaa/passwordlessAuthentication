import type { NativeStackScreenProps } from '@react-navigation/native-stack';


export type RootStackParamList = {
  Login: undefined;
  Otp: { email: string };
  Session: { email: string };
};

export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type OtpScreenProps = NativeStackScreenProps<RootStackParamList, 'Otp'>;
export type SessionScreenProps = NativeStackScreenProps<RootStackParamList, 'Session'>;

/**
 * Declaration merging for useNavigation hook
 */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
