/**
 * Navigation module exports
 * Re-exports the main AppNavigator for easy importing
 */

export { default as AppNavigator } from './AppNavigator';
export { default as AuthStack } from './AuthStack';
export { default as StudentTabs } from './StudentTabs';
export { default as TeacherTabs } from './TeacherTabs';
export { default as SecurityTabs } from './SecurityTabs';
export { default as ManagementTabs } from './ManagementTabs';
export { default as ParentTabs } from './ParentTabs';

export type { AuthStackParamList } from './AuthStack';
export type { StudentTabsParamList } from './StudentTabs';
export type { TeacherTabsParamList } from './TeacherTabs';
export type { SecurityTabsParamList } from './SecurityTabs';
export type { ManagementTabsParamList } from './ManagementTabs';
export type { ParentTabsParamList } from './ParentTabs';
