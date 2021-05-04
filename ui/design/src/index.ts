// @ts-nocheck
/* Components */
import {
  Box,
  Grid,
  Image,
  Grommet,
  grommet,
  ResponsiveContext,
  ThemeContext,
  Text,
  Carousel,
} from 'grommet';

import styled, { createGlobalStyle, css, withTheme } from 'styled-components';

import Autosizer from 'react-virtualized-auto-sizer';

import { ToastProvider } from 'react-toast-notifications';

import Avatar from './components/Avatar';
import EditableAvatar from './components/EditableAvatar';

import Sidebar from './components/SideBar';
import Topbar from './components/TopBar';

import EditorCard from './components/EditorCard';
import { CommentEditor } from './components/EditorCard/comment-editor';
import { EditorPlaceholder } from './components/EditorCard/editor-placeholder';

import EntryCard from './components/EntryCard';
import { EntryBox } from './components/EntryCard/entry-box';
import { EntryCardHidden } from './components/EntryCard/entry-card-hidden';
import {
  BasicCardBox,
  MainAreaCardBox,
  WidgetAreaCardBox,
  ModalCard,
} from './components/EntryCard/basic-card-box';

import BoxFormCard from './components/BoxFormCard';
import EnsFormCard from './components/EnsFormCard';

import NotificationsCard from './components/NotificationCard';

import CustomizeFeedCard from './components/OnboardingCard';

import ProfileCard from './components/ProfileCard';
import { ProfileSearchCard } from './components/ProfileCard/profile-search-card';
import { ProfileWidgetCard } from './components/ProfileCard/profile-widget-card';
import { ProfileMiniCard } from './components/ProfileCard/profile-mini-card';

import TagCard from './components/TagCard';
import { TagDetailCard } from './components/TagCard/tag-detail-card';
import { TagProfileCard } from './components/TagCard/tag-profile-card';
import { TagSearchCard } from './components/TagCard/tag-search-card';

import FilterCard from './components/FilterCard';
import SwitchCard from './components/SwitchCard';
import MdCard from './components/MdCard';

import AppInfoWidgetCard from './components/AppInfoWidgetCard';
import AppsWidgetCard from './components/AppsWidgetCard';
import CookieWidgetCard from './components/CookieCard';
import LoginCTAWidgetCard from './components/LoginCTAWidgetCard';
import SourcesWidgetCard from './components/SourcesWidgetCard';
import MiniInfoWidgetCard from './components/MiniInfoWidgetCard';
import TopicsWidgetCard from './components/TopicsWidgetCard';
import TrendingWidgetCard from './components/TrendingWidgetCard';
import TutorialWidgetCard from './components/TutorialWidgetCard';

import EntryCardLoading from './components/VirtualList/placeholders/entry-card-placeholder';

import Button from './components/Button';
import DuplexButton from './components/DuplexButton';
import IconButton from './components/IconButton';
import IconLink from './components/IconLink';
import ProfileAvatarButton from './components/ProfileAvatarButton';
import VoteIconButton from './components/VoteIconButton';

import AreaChart from './components/AreaChart';
import LineChart from './components/LineChart';
import ResponsiveChart from './components/ResponsiveChart';

import { EditorBox, EditorMeter, editorDefaultValue } from './components/Editor';

import HorizontalDivider from './components/HorizontalDivider';

import ErrorLoader from './components/ErrorLoader';
import { ErrorInfoCard } from './components/ErrorLoader/error-info-card';
import EntryPublishErrorCard from './components/EntryPublishErrorCard';
import ModerationAppErrorCard from './components/ModerationAppErrorCard';

import TextInputField from './components/TextInputField';

import Icon, { iconTypes } from './components/Icon';
import { AppIcon } from './components/Icon/app-icon';

import CommentInput from './components/CommentInput';
import SearchInput from './components/SearchInput';
import DropSearchInput from './components/DropSearchInput';

import EditorModal from './components/EditorModal';
import ShareModal from './components/ShareModal';
import { StyledLayer } from './components/ListModal/styled-modal';
import LoginModal from './components/LoginModal';
import { EthProviderListModal } from './components/LoginModal/eth-provider-list-modal';
import { EthProviderModal } from './components/LoginModal/eth-provider-modal';
import { EthProviderListModal } from './components/LoginModal/eth-provider-list-modal';
import { ModalContainer } from './components/LoginModal/fullscreen-modal-container';
import { ModalRenderer } from './components/LoginModal/modal-renderer';
import MobileListModal from './components/MobileListModal';
import ModerateModal from './components/ModerateModal';
import ReportModal from './components/ReportModal';
import ProfileCompletedModal from './components/ProfileCompletedModal';
import FeedbackModal from './components/FeedbackModal';

import { NotificationsPopover, SelectPopover } from './components/Popovers';
import ViewportSizeProvider, { useViewportSize } from './components/Providers/viewport-dimension';
import { SubtitleTextIcon, TextIcon } from './components/TextIcon';
import VirtualList from './components/VirtualList';
import type { Helmet as HelmetType } from '@types/react-helmet';
import Helmet from 'react-helmet';
import { Notification, notify, BookmarkPill, NewPostsPill } from './components/Notification';
import Spinner from './components/Spinner';

/* Utilities (these are not components) */
import responsiveBreakpoints from './styles/responsive-breakpoints';
import { formatImageSrc } from './utils/image-utils';
import { isBase64 } from './utils/string-utils';
import { formatRelativeTime } from './utils/time';

/* Themes and theme related utils */
import darkTheme from './styles/themes/dark';
import lightTheme from './styles/themes/light';
import { createTheme } from './styles/themes/utils/create-theme';
import { ThemeSelector } from './styles/themes/utils/theme-selector';

/* Grommet utils */
// @TODO: fix this export style...
const exported = {
  Autosizer,
  Avatar,
  AppIcon,
  AreaChart,
  LineChart,
  ResponsiveChart,
  Button,
  Carousel,
  DuplexButton,
  EditableAvatar,
  ErrorInfoCard,
  ErrorLoader,
  ModerationAppErrorCard,
  AppInfoWidgetCard,
  AppsWidgetCard,
  BasicCardBox,
  BookmarkPill,
  NewPostsPill,
  CustomizeFeedCard,
  DropSearchInput,
  EditorBox,
  EditorMeter,
  editorDefaultValue,
  CommentEditor,
  EditorCard,
  EditorPlaceholder,
  EditorModal,
  EntryBox,
  EntryCard,
  EntryCardHidden,
  EntryCardLoading,
  BoxFormCard,
  EnsFormCard,
  MiniInfoWidgetCard,
  ProfileCard,
  ProfileSearchCard,
  ProfileWidgetCard,
  ProfileMiniCard,
  TextInputField,
  TopicsWidgetCard,
  TagCard,
  TagDetailCard,
  TagProfileCard,
  TagSearchCard,
  Icon,
  iconTypes,
  IconButton,
  IconLink,
  LoginModal,
  ProfileAvatarButton,
  VoteIconButton,
  CommentInput,
  SearchInput,
  MainAreaCardBox,
  NotificationsPopover,
  ShareModal,
  ReportModal,
  ModerateModal,
  ProfileCompletedModal,
  FeedbackModal,
  Spinner,
  ToastProvider,
  SelectPopover,
  SubtitleTextIcon,
  Sidebar,
  Text,
  TextIcon,
  Topbar,
  createTheme,
  darkTheme,
  lightTheme,
  Box,
  Grid,
  Image,
  Grommet,
  grommet,
  ResponsiveContext,
  responsiveBreakpoints,
  ThemeContext,
  ThemeSelector,
  css,
  styled,
  withTheme,
  createGlobalStyle,
  ViewportSizeProvider,
  useViewportSize,
  VirtualList,
  isBase64,
  formatImageSrc,
  formatRelativeTime,
  WidgetAreaCardBox,
  ModalCard,
  EthProviderListModal,
  EthProviderModal,
  MobileListModal,
  ModalContainer,
  ModalRenderer,
  Notification,
  NotificationsCard,
  notify,
  HorizontalDivider,
  LoginCTAWidgetCard,
  TrendingWidgetCard,
  SourcesWidgetCard,
  TutorialWidgetCard,
  CookieWidgetCard,
  FilterCard,
  SwitchCard,
  MdCard,
  EntryPublishErrorCard,
  StyledLayer,
  Helmet: Helmet as HelmetType,
};

export default exported;
