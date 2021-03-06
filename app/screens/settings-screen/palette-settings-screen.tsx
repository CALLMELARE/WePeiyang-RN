import * as React from "react"
import { connect } from "react-redux"

import {
  Platform,
  ScrollView,
  StatusBar,
  TextStyle,
  View,
  ViewStyle,
  TouchableOpacity as Touchable,
  ImageBackground,
} from "react-native"
import { Text } from "../../components/text"
import { Screen } from "../../components/screen"
import { color, layoutParam } from "../../theme"
import { NavigationScreenProps } from "react-navigation"
import { restorePalette, setPalette } from "../../actions/preference-actions"
import { TopBar } from "../../components/top-bar"
import ss from "./settings-screen.styles"
import Modal from "react-native-modal"

import RNRestart from "react-native-restart"
import { NativeModules } from "react-native"
import { TextField } from "../../components/text-field"
import { Button } from "../../components/button"
import { Alert } from "../../components/alert"

const screenPalette = [color.black(1), color.white(1)]
const textColor = {
  color: screenPalette[1],
} as TextStyle

export interface ColorSnackProps {
  color
  sendColor
}
export class ColorSnack extends React.Component<ColorSnackProps, {}> {
  state = {
    isModalVisible: false,
    colorSelected: this.props.color,
  }
  openModal = () => {
    this.setState({ isModalVisible: true })
  }
  closeModal = () => {
    this.setState({ isModalVisible: false, userInformed: false })
  }
  randomColor = () => {
    this.setState({
      colorSelected: `rgb(${Math.floor(Math.random() * 255)},${Math.ceil(
        Math.random() * 255,
      )},${Math.ceil(Math.random() * 255)})`,
    })
  }
  emitColor = () => {
    this.props.sendColor(this.state.colorSelected)
  }

  render() {
    const ssColorSnack = {
      panel: {
        padding: 40,
        marginHorizontal: 25,
        backgroundColor: color.black(1),
      } as ViewStyle,
      window: {
        width: "100%",
        aspectRatio: 1,
        marginBottom: 20,
      } as ViewStyle,
      snack: {
        height: 40,
        marginBottom: 11,
        backgroundColor: color.background,
        borderRadius: layoutParam.borderRadius,
        overflow: "hidden",
      } as ViewStyle,
      field: {
        backgroundColor: color.transparent,
        padding: 0,
        marginLeft: -1,
      } as ViewStyle,
      row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      } as ViewStyle,
      input: {
        backgroundColor: color.transparent,
        paddingHorizontal: 0,
        fontSize: 35,
        color: screenPalette[1],
        marginBottom: 10,
        marginTop: -10,
      } as TextStyle,
      hint: {
        color: screenPalette[1],
        fontSize: 10,
        marginBottom: 3,
      } as TextStyle,
      button: {
        alignSelf: "flex-start",
        marginRight: 10,
        marginBottom: 10,
      } as ViewStyle,
      buttonRow: {
        flexDirection: "row",
        marginTop: 10,
        flexWrap: "wrap",
      } as ViewStyle,
      fillSnack: {
        alignSelf: "stretch",
        flex: 1,
        backgroundColor: this.state.colorSelected,
      } as ViewStyle,
      fillWindow: {
        alignSelf: "stretch",
        flex: 1,
        backgroundColor: this.props.color,
      } as ViewStyle,
    }
    return (
      <>
        <Modal
          isVisible={this.state.isModalVisible}
          onBackButtonPress={this.closeModal}
          onBackdropPress={this.closeModal}
          useNativeDriver={true}
          backdropOpacity={0.8}
        >
          <View style={ssColorSnack.panel}>
            <ImageBackground
              source={require("../../assets/transparent-base.png")}
              style={ssColorSnack.window}
            >
              <View style={ssColorSnack.fillSnack} />
            </ImageBackground>
            <View style={ssColorSnack.row}>
              <Text
                tx="settings.palette.inputColor"
                preset="lausanne"
                style={[textColor, { fontWeight: "bold" }]}
              />
              <Touchable onPress={this.randomColor}>
                <Text text="shuffle" preset="i" style={textColor} />
              </Touchable>
            </View>
            <TextField
              placeholder={this.props.color}
              style={ssColorSnack.field}
              inputStyle={ssColorSnack.input}
              value={this.state.colorSelected}
              onChangeText={text => this.setState({ colorSelected: text })}
              autoCorrect={false}
            />
            <Text tx="settings.palette.formats" style={ssColorSnack.hint} />
            <Text text="• rgb(255, 255, 0)" style={ssColorSnack.hint} />
            <Text text="• rgba(255, 255, 0, 1)" style={ssColorSnack.hint} />
            <Text text="• #FFFF00" style={ssColorSnack.hint} />
            <Text text="• #FFFF00FF" style={ssColorSnack.hint} />
            <View style={ssColorSnack.buttonRow}>
              <Button
                tx="common.confirm"
                onPress={() => {
                  this.emitColor()
                  this.closeModal()
                }}
                style={ssColorSnack.button}
                preset="small"
                palette={screenPalette}
              />
              <Button
                tx="common.cancel"
                onPress={() => {
                  this.closeModal()
                }}
                style={ssColorSnack.button}
                preset="small"
                palette={[screenPalette[1], color.white(0.1)]}
              />
            </View>
          </View>
        </Modal>
        <Touchable onPress={this.openModal}>
          <View style={ssColorSnack.snack}>
            <View style={ssColorSnack.fillWindow} />
          </View>
        </Touchable>
      </>
    )
  }
}

export interface PaletteSettingsScreenProps extends NavigationScreenProps<{}> {
  pref?
  setPalette?
  restorePalette?
}

class _PaletteSettingsScreen extends React.Component<PaletteSettingsScreenProps, {}> {
  state = {
    isModalVisible: false,
  }
  sendColor = (colorToSend, dest, index) => {
    let existingPalette = [...this.props.pref.palette[dest]]
    existingPalette[index] = colorToSend
    this.props.setPalette(dest, existingPalette)
  }
  reload = () => {
    if (Platform.OS === "ios") NativeModules.DevSettings.reload()
    else RNRestart.Restart()
  }
  toggleModal = () => {
    this.setState({ isModalVisible: !this.state.isModalVisible })
  }
  reset = () => {
    this.toggleModal()
  }

  render() {
    const { pref } = this.props
    console.log(pref)

    return (
      <Screen style={{ backgroundColor: screenPalette[0] }}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <Modal
          isVisible={this.state.isModalVisible}
          backdropColor={screenPalette[0]}
          onBackButtonPress={this.toggleModal}
          onBackdropPress={this.toggleModal}
          useNativeDriver={true}
        >
          <Alert
            headingTx="settings.palette.restoreConfirm"
            palette={[screenPalette[0], screenPalette[1]]}
            buttons={[
              {
                tx: "common.confirm",
                onPress: () => {
                  this.props.restorePalette()
                  this.toggleModal()
                },
              },
            ]}
          />
        </Modal>

        <ScrollView showsVerticalScrollIndicator={false}>
          <TopBar
            elements={{
              left: [
                {
                  iconText: "arrow_back",
                  action: () => this.props.navigation.goBack(),
                },
              ],
              right: [],
            }}
            color={screenPalette[1]}
          />

          <View style={ss.container}>
            <Text preset="h2" style={[ss.heading, textColor]}>
              <Text tx="settings.palette.title" />
            </Text>
            <Text tx="settings.palette.intro" preset="small" style={[ss.small, textColor]} />
            <Text tx="modules.gpa" preset="lausanne" style={[ss.sectionHead, textColor]} />
            <ColorSnack
              color={pref.palette.gpa[0]}
              sendColor={colorToSend => this.sendColor(colorToSend, "gpa", 0)}
            />

            <Text tx="modules.contact" preset="lausanne" style={[ss.sectionHead, textColor]} />
            <ColorSnack
              color={pref.palette.yellowPages[0]}
              sendColor={colorToSend => this.sendColor(colorToSend, "yellowPages", 0)}
            />
            <ColorSnack
              color={pref.palette.yellowPages[1]}
              sendColor={colorToSend => this.sendColor(colorToSend, "yellowPages", 1)}
            />
            <ColorSnack
              color={pref.palette.yellowPages[2]}
              sendColor={colorToSend => this.sendColor(colorToSend, "yellowPages", 2)}
            />

            <Text tx="modules.schedule" preset="lausanne" style={[ss.sectionHead, textColor]} />
            <ColorSnack
              color={pref.palette.schedule[0]}
              sendColor={colorToSend => this.sendColor(colorToSend, "schedule", 0)}
            />
            <ColorSnack
              color={pref.palette.schedule[1]}
              sendColor={colorToSend => this.sendColor(colorToSend, "schedule", 1)}
            />
            <ColorSnack
              color={pref.palette.schedule[2]}
              sendColor={colorToSend => this.sendColor(colorToSend, "schedule", 2)}
            />
            <ColorSnack
              color={pref.palette.schedule[3]}
              sendColor={colorToSend => this.sendColor(colorToSend, "schedule", 3)}
            />
            <ColorSnack
              color={pref.palette.schedule[4]}
              sendColor={colorToSend => this.sendColor(colorToSend, "schedule", 4)}
            />
            <ColorSnack
              color={pref.palette.schedule[5]}
              sendColor={colorToSend => this.sendColor(colorToSend, "schedule", 5)}
            />

            <Text tx="modules.ecard" preset="lausanne" style={[ss.sectionHead, textColor]} />
            <ColorSnack
              color={pref.palette.ecard[0]}
              sendColor={colorToSend => this.sendColor(colorToSend, "ecard", 0)}
            />
            <ColorSnack
              color={pref.palette.ecard[1]}
              sendColor={colorToSend => this.sendColor(colorToSend, "ecard", 1)}
            />
            <ColorSnack
              color={pref.palette.ecard[2]}
              sendColor={colorToSend => this.sendColor(colorToSend, "ecard", 2)}
            />

            <Text
              tx="settings.palette.actions"
              preset="lausanne"
              style={[ss.sectionHead, textColor]}
            />
            <Text tx="settings.palette.actionsHint" preset="small" style={[ss.small, textColor]} />
            <Button
              palette={[screenPalette[1], color.white(0.1)]}
              tx="settings.palette.restore"
              onPress={this.toggleModal}
              style={{
                marginBottom: 15,
              }}
              textStyle={{
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            />

            <Button
              palette={[screenPalette[1], color.white(0.1)]}
              tx="common.saveChanges"
              onPress={this.reload}
              style={{
                marginBottom: 15,
              }}
              textStyle={{
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            />
          </View>
        </ScrollView>
      </Screen>
    )
  }
}

const mapStateToProps = state => {
  return {
    pref: state.preferenceReducer,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setPalette: (key, value) => {
      dispatch(setPalette(key, value))
    },
    restorePalette: () => {
      dispatch(restorePalette())
    },
  }
}

export const PaletteSettingsScreen = connect(
  mapStateToProps,
  mapDispatchToProps,
)(_PaletteSettingsScreen)
