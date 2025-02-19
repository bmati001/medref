import React, { useState, useEffect } from 'react'
import { Text, View, StyleSheet, TouchableOpacity, SafeAreaView, FlatList, TouchableWithoutFeedback, Switch } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { MaterialIcons } from '@expo/vector-icons'
import data from '../data/data.json'

/**
 * 
 * sublayout list will go to render all the sections within a top level node
 * within each section, if there are children and there is NO section name 
 * then we make an array (selectedChildArr) of all the children for that section
 * if there is no section_name then children / children of children will all be rendered WITHIN this page
 * meaning subdetails page will never be nav'd to even if we have a section with children and sub children!
 * 
 * otherwise, if we do have a section_name, then just push the section object onto the list (selected Id Arr)
 * and clicking on one of the list items will actually navigate you to the sub details page !!!
 */

const Item = ({ item, backgroundColor, onPress, textColor }) => (
  <View style={{ flex: 1, alignItems: 'center' }}>
    <TouchableOpacity onPress={onPress} style={[styles.SubmitButtonStyle, backgroundColor = backgroundColor]}>
      <Text style={[styles.title, textColor]}>{item.section_name}</Text>
      <MaterialIcons name='keyboard-arrow-down' size={30} style={{ color: 'white' }} />
    </TouchableOpacity>
  </View>
)

const ItemDetails = ({ item, backgroundColor, onPress, textColor }) => (
  <TouchableOpacity onPress={onPress} style={[styles.SubmitButtonStyle, backgroundColor = backgroundColor]}>
    <Text style={[styles.title, textColor]}>{item.child_name}</Text>
    <MaterialIcons name={item.expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={30} style={{ color: 'white' }} />
  </TouchableOpacity>
)

const ItemDetailsDesc = ({ childDetailDesc, borderColor, textColor }) => (
  <TouchableWithoutFeedback>
    <View style={[styles.ChildButtonStyle, borderColor = borderColor]}>
      <Text style={[styles.title, textColor]}>{childDetailDesc}</Text>
    </View>
  </TouchableWithoutFeedback>
)

const ItemDetailHeader = ({ headerText }) => (
  <View style={{paddingLeft: 16, paddingRight: 8}}><Text>{headerText}</Text></View>
)

const ItemDetailFooter = ({ footerText }) => (
  <View style={{paddingLeft: 16, paddingRight: 8}}><Text>{footerText}</Text></View>
)

export default function SubLayoutList (props) {
  const [selectedId, setSelectedId] = useState(null)
  const [selectedIdArr, setSelectedIdArr] = useState([])
  const [selectedIdChildArr, setSelectedChildArr] = useState([])
  const [displayDetails, setDisplayDetails] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)

  const arr = []

  const resetState = () => {
    setSelectedChildArr([])
    setSelectedId(null)
    setDisplayDetails(false)
    setIsEnabled(false)
  }

  useEffect(() => {
    resetState()
    const arrRaw = []
    const arrTemp = []

    const temp = []
    const childArr = []

    data.map(obj => {
      if (obj.id === props.selectedValue) {
        obj.section.map((item) => {
          const ob = {}
          ob.section_id = item.section_id,
          ob.section_name = item.section_name

          let tempText = ''
          let tempText1 = ''
          if (item.multiple_lines) {
            tempText = item.section_name1 ? item.section_name1 : '',
            tempText1 = item.section_name2 ? item.section_name2 : ''
            ob.section_name = item.section_name + ' ' + tempText + ' ' + tempText1
          }
          ob.section_hexvalue = obj.hexvalue
          ob.expanded = false

          if (item.section_name === '' && item.children.length) {
            setDisplayDetails(true)
            item.children.map(childItem => {
              const childDetArr = []
              const obChild = {}
              obChild.section_id = item.section_id,
              obChild.child_id = childItem.child_id,
              obChild.child_name = childItem.child_name,
              obChild.backgroundColor = item.section_hexvalue,
              obChild.special_instruction_header = childItem.special_instruction_header,
              obChild.special_instruction_footer = childItem.special_instruction_footer
              obChild.expanded = false

              childItem.children.map(childDetails => {
                const obChildDetail = {}
                obChildDetail.child_id = childDetails.child_id,
                obChildDetail.child_detail_name = childDetails.child_detail_name,
                obChildDetail.child_detail_desc = childDetails.child_detail_desc,
                obChildDetail.child_bullets = childDetails.child_bullets,
                obChildDetail.child_subheader = childDetails.child_subheader,
                childDetArr.push(obChildDetail)
              })
              obChild.children = childDetArr
              childArr.push(obChild)
            })
          } else {
            setDisplayDetails(false)
          }
          temp.push(ob)
        })
      }
    })
    setSelectedChildArr(childArr)
    setSelectedIdArr(temp)
  }, [props])

  const renderItem1 = ({ item }) => {
    const backgroundColor = item.section_hexvalue
    const color = '#fff'

    if (item.section_name !== '') {
      return (
        <Item
          item={item}
          onPress={() => callParentFunction(item.section_id)}
          backgroundColor={{ backgroundColor }}
          textColor={{ color }}
        />
      )
    }
  }

  const renderItem = ({ item }) => {
    const backgroundColor = item.backgroundColor
    const borderColor = item.backgroundColor
    let color = item.backgroundColor

    const childArrLength = item.children.length - 1

    let items = []

    if (item.children) {
      items = item.children.map((row, index) => {
        return (
          <View key={index} style={{ justifyContent: 'center' }}>
            {
              index === 0 && <ItemDetailHeader headerText={item.special_instruction_header} />
            }

            {row.child_detail_name && (
              <ItemDetailsDesc childDetailDesc={row.child_detail_name} borderColor={{ borderColor }} textColor={{ color }} />
            )}

            {row.child_detail_desc && (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 20, justifyContent: 'center', marginTop: 5 }}>{row.child_detail_desc}</Text>
              </View>
            )}    

            {row.child_bullets && (
              <View style={{ alignItems: 'left', justifyContent: 'left', paddingLeft: 5, marginTop: 10 }}>
                {row.child_bullets.map((bullet, idx) => (
                  <View style={{ flexDirection: 'column', justifyContent: 'left' }} key={idx}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'left' }}>{bullet.title}</Text>
                    <Text style={{ fontSize: 20, textAlign: 'left' }}>{bullet.subtext}</Text>
                  </View>
                ))}
              </View>
            )}      

            {index === childArrLength && (
              <ItemDetailFooter footerText={item.special_instruction_footer} />
            )}

          </View>
        )
      })
    }

    color = '#fff'
    return (
      <View>
        <ItemDetails
          item={item}
          onPress={() => expandItemDetails(item.child_id)}
          backgroundColor={{ backgroundColor }}
          textColor={{ color }}
        />

        {item.expanded &&
          <View style={styles.TextComponentStyle}>{items}</View>}

      </View>

    )
  }

  const toggleSwitch = () => {
    const tempArray = [...selectedIdChildArr]
    if (isEnabled) {
      tempArray.map((item, index) => {
        item.expanded = false
      })
    } else {
      tempArray.map((item, index) => {
        item.expanded = true
      })
    }
    setSelectedChildArr(tempArray)
    setIsEnabled(previousState => !previousState)
  }

  const expandItemDetails = (value) => {
    const updatedArr = selectedIdChildArr.map((item, index) => {
      if (item.child_id === value) {
        return {
          ...item,
          expanded: !item.expanded
        }
      }
      return item
    })
    setSelectedChildArr(
      updatedArr
    )
  }

  const callParentFunction = (value) => {
    props.showSubDetails(value)
  }

  const EmptyList = () => {
    return (
      <View><Text style={styles.title}>No Data Found</Text></View>
    )
  }

  const renderFlatList = () => {
    if (!displayDetails) {
      return (
        <FlatList
          data={selectedIdArr}
          renderItem={({ item, index }) => renderItem1({ item })}
          keyExtractor={(item, index) => item.section_id.toString()}
          ListEmptyComponent={EmptyList}
          extraData={selectedIdArr}
        />
      )
    } else {
      return (
        <View>
          <View style={styles.switchview}>
            <View style={{ height: 25 }}>
              <Text style={{ fontSize: 20 }}>* expand all</Text>
            </View>
            <View>
              <Switch
                trackColor={{ false: '#9dcddf', true: '#63a1b0' }}
                thumbColor='#fbfbfb'
                ios_backgroundColor='#3e3e3e'
                style={{ transform: [{ scaleX: 1.0 }, { scaleY: 1.0 }] }}
                onValueChange={toggleSwitch}
                value={isEnabled}
              />
            </View>
          </View>
          <FlatList
            data={selectedIdChildArr}
            renderItem={({ item }) => renderItem({ item })}
            keyExtractor={(item) => item.child_id.toString()}
            ListEmptyComponent={EmptyList}
          />
        </View>
      )
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderFlatList()}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginTop: 25
  },
  item: {
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 16,
    width: 300
  },
  title: {
    fontSize: 20,
    marginLeft: 10,
    marginRight: 10
  },
  TextComponentStyle: {
    marginLeft: 30,
    marginRight: 30,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#fff',
    width: 300,
    // Set border Hex Color Code Here.
    borderTopColor: '#fff',
    borderBottomColor: '#fff',
    borderLeftColor: '#000',
    borderRightColor: '#000',
    // Setting up Text Font Color.
    color: '#000',
    // Setting Up Background Color of Text component.
    backgroundColor: '#fff',
    // Adding padding on Text component.
    fontSize: 20,
    textAlign: 'center',
    elevation: 50,

    shadowColor: '#A9A9A9',
    shadowRadius: 10,
    shadowOpacity: 1
  },
  SubmitButtonStyle: {
    marginTop: 10,
    paddingTop: 15,
    paddingBottom: 15,
    marginLeft: 30,
    marginRight: 30,
    borderColor: '#fff',
    borderRadius: 25,
    borderWidth: 1,
    width: 300,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  TextComponentChildStyle: {
    padding: 15
  },
  ChildButtonStyle: {
    marginTop: 10,
    paddingTop: 10,
    paddingBottom: 10,
    marginLeft: 30,
    marginRight: 30,
    backgroundColor: '#fff',
    borderRadius: 25,
    fontWeight: '200',
    borderWidth: 3,
    width: 250,
    alignItems: 'center',
    justifyContent: 'center'
  },
  ChildTextStyle: {

    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 25
  },
  TextStyle: {
    color: '#000',
    textAlign: 'center'
  },
  switchview: {
    marginBottom: 5,
    height: 20,
    paddingBottom: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  }

})
