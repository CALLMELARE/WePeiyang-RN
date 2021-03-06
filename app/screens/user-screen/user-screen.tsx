/*
 * User Screen
 * Created by Tzingtao Chow
 * ---
 *
 * User Screen 是点击主页个人头像后进入的个人信息页面。
 * 它包含了用户头像、基本信息、账号绑定状态和登出按钮。
 *
 */

import * as React from "react"
import { DeviceEventEmitter, Image, ScrollView, StatusBar, View } from "react-native"
import { connect } from "react-redux"
import { Screen } from "../../components/screen"
import { NavigationEvents, NavigationScreenProps } from "react-navigation"
import { Text } from "../../components/text"
import { Gradicon } from "./components/gradicon"
import { BindingBar } from "./components/binding-bar"
import { Button } from "../../components/button"
import { deleteTokenFromStore } from "../../services/twt-fetch"
import AsyncStorage from "@react-native-community/async-storage"

import ss from "./user-screen.style"
import {
  clearAllData,
  fetchUserData,
  unbindLibAccount,
  unbindTjuAccount,
} from "../../actions/data-actions"
import { TopBar } from "../../components/top-bar"
import { Toasti } from "../../components/toasti"
import { color, shadowPresets } from "../../theme"
import Modal from "react-native-modal"
import { UnbindModal } from "./components/unbind-modal"

export interface UserScreenProps extends NavigationScreenProps<{}> {
  compData?
  clearAllData?
  fetchUserData?
}

class _UserScreen extends React.Component<UserScreenProps, {}> {
  state = {
    isModalVisible: false,
    selectedUnbindAction: () => {},
    origin: "",
  }

  logout = () => {
    this.props.clearAllData()
    this.deleteToken().then(() => {
      DeviceEventEmitter.emit("showToast", <Toasti tx="auth.logoutSuccess" />)
      this.props.navigation.navigate("authLoading")
    })
  }

  unbindTju = () => {
    this.toggleModal()
    unbindTjuAccount()
      .then(() => {
        DeviceEventEmitter.emit("showToast", <Toasti tx="accountBinding.unbindSuccess" />)
        this.props.navigation.goBack()
      })
      .catch(err => {
        console.log(err)
        DeviceEventEmitter.emit(
          "showToast",
          <Toasti text={`${err.error_code} / ${err.message}`} preset="error" />,
        )
      })
      .then(() => {
        this.setState({ loggingIn: false })
      })
  }

  unbindLib = () => {
    this.toggleModal()
    unbindLibAccount()
      .then(() => {
        DeviceEventEmitter.emit("showToast", <Toasti tx="accountBinding.unbindSuccess" />)
        this.props.navigation.goBack()
      })
      .catch(err => {
        console.log(err)
        DeviceEventEmitter.emit(
          "showToast",
          <Toasti text={`${err.error_code} / ${err.message}`} preset="error" />,
        )
      })
      .then(() => {
        this.setState({ loggingIn: false })
      })
  }

  unbindEcard = () => "NO_ACTION_NEEDED"

  deleteToken = async () => {
    deleteTokenFromStore()
    try {
      await AsyncStorage.removeItem("@WePeiyangRN_token")
    } catch (e) {
      DeviceEventEmitter.emit("showToast", <Toasti tx="auth.tokenDeleteFailure" preset="error" />)
    }
  }

  toggleModal = () => {
    this.setState({ isModalVisible: !this.state.isModalVisible })
  }

  render() {
    const { compData } = this.props
    if (compData.userInfo.status !== "VALID") {
      return <View />
    }

    return (
      <Screen>
        <NavigationEvents
          onWillFocus={() => {
            this.props.fetchUserData()
          }}
        />

        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

        <Modal
          isVisible={this.state.isModalVisible}
          backdropColor={ss.headPanel.backgroundColor}
          onBackButtonPress={this.toggleModal}
          onBackdropPress={this.toggleModal}
          backdropOpacity={0.9}
          useNativeDriver={true}
        >
          <UnbindModal
            actions={[this.state.selectedUnbindAction, this.toggleModal]}
            origin={this.state.origin}
          />
        </Modal>

        <View style={ss.headPanel}>
          <View style={ss.ambient1} />
          <View style={ss.ambient2} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <TopBar
            elements={{
              left: [
                {
                  iconText: "arrow_back",
                  action: () => this.props.navigation.goBack(),
                },
              ],
              right: [
                {
                  iconText: "settings",
                  action: () => this.props.navigation.navigate("settings"),
                },
              ],
            }}
            color={color.background}
          />

          <View style={ss.container}>
            <View style={ss.userInfoPanel}>
              <Image
                loadingIndicatorSource={require("../../assets/loading.png")}
                source={{ uri: compData.userInfo.data.avatar }}
                style={ss.avatar}
              />
              <Text text={compData.userInfo.data.twtuname} style={ss.userName} preset="h4" />
              <Text
                text={`${compData.userInfo.data.studentid} / ${compData.userInfo.data.realname}`}
                style={ss.userId}
                preset="small"
              />
            </View>
            <View style={[ss.shortcutModulePanel, shadowPresets.close]}>
              <Gradicon
                onPress={() => {
                  if (compData.userInfo.data.accounts.tju) {
                    this.props.navigation.navigate("gpa")
                  } else {
                    this.props.navigation.navigate("tjuBind")
                  }
                }}
                source={require("./assets/gradicon1.png")}
                tx="modules.gpa"
              />
              <Gradicon
                onPress={() => this.props.navigation.navigate("home")}
                source={require("./assets/gradicon2.png")}
                tx="modules.library"
              />
              <Gradicon
                onPress={() => {
                  if (compData.ecard.auth.status === "BOUND") {
                    this.props.navigation.navigate("ecard")
                  } else {
                    this.props.navigation.navigate("ecardBind")
                  }
                }}
                source={require("./assets/gradicon3.png")}
                tx="modules.ecard"
              />
            </View>
            <BindingBar
              onPress={() => {
                if (compData.userInfo.data.accounts.tju) {
                  this.setState(
                    {
                      selectedUnbindAction: this.unbindTju,
                      origin: "TJU",
                    },
                    this.toggleModal,
                  )
                } else {
                  this.props.navigation.navigate("tjuBind")
                }
              }}
              style={ss.bindingBar}
              txTitle="accountBinding.portalAccount"
              txSubtitle={
                compData.userInfo.data.accounts.tju
                  ? "accountBinding.bound"
                  : "accountBinding.unbound"
              }
              icon="event_note"
            />

            <BindingBar
              onPress={() => {
                if (compData.userInfo.data.accounts.lib) {
                  this.setState(
                    {
                      selectedUnbindAction: this.unbindLib,
                      origin: "LIB",
                    },
                    this.toggleModal,
                  )
                } else {
                  this.props.navigation.navigate("libBind")
                }
              }}
              style={ss.bindingBar}
              txTitle="accountBinding.libraryAccount"
              txSubtitle={
                compData.userInfo.data.accounts.lib
                  ? "accountBinding.bound"
                  : "accountBinding.unbound"
              }
              icon="book"
            />

            <BindingBar
              onPress={() => {
                if (compData.ecard.auth.status === "BOUND") {
                  this.setState(
                    {
                      selectedUnbindAction: this.unbindEcard,
                      origin: "ECARD",
                    },
                    this.toggleModal,
                  )
                } else {
                  this.props.navigation.navigate("ecardBind")
                }
              }}
              style={ss.bindingBar}
              txTitle="accountBinding.ecardAccount"
              txSubtitle={
                compData.ecard.auth.status === "BOUND"
                  ? "accountBinding.bound"
                  : "accountBinding.unbound"
              }
              icon="credit_card"
            />

            <Button style={ss.logoutButton} preset="primary" onPress={this.logout}>
              <View style={ss.logoutButtonContentWrapper}>
                <Text style={ss.logoutIcon} preset="i" text="exit_to_app" />
                <Text style={ss.logoutText} tx="auth.logout" />
              </View>
            </Button>
          </View>
        </ScrollView>
      </Screen>
    )
  }
}

const mapStateToProps = state => {
  return {
    compData: state.dataReducer,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    clearAllData: () => {
      dispatch(clearAllData())
    },
    fetchUserData: async () => {
      await dispatch(fetchUserData())
    },
  }
}

export const UserScreen = connect(
  mapStateToProps,
  mapDispatchToProps,
)(_UserScreen)
