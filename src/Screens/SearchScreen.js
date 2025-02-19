import React, { useState } from 'react'
import { 
  View, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  Text, 
  ActivityIndicator, 
  TouchableWithoutFeedback,
  SafeAreaView, 
  Dimensions, 
  FlatList 
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import searchData from '../data/searchData'


export default function SearchScreen ({ route, navigation }) {
  const [searchResults, setSearchResults] = useState([])
  const [resultsLoading, setResultsLoading] = useState(false)

  const searchDebounce = () => {
    let timer = undefined
    return function(searchText) {
      if (!searchText) {
        setResultsLoading(false)
        return []
      }
      if (timer !== undefined) {
        clearTimeout(timer)
      }
      timer = setTimeout(() => {
        setResultsLoading(false)
        const results = searchData(searchText)
        setSearchResults(results)
      }, 2000)
    }
  }

  const debounce = searchDebounce()

  const onSearchInputChanged = (newSearchText) => {
    if (!newSearchText) {
      setResultsLoading(false)
      setSearchResults([])
      return
    }
    setResultsLoading(true)
    debounce(newSearchText)
  }

  const showSubDetails = (node) => { // navigate to sub details screen 
    const parentId = parseInt(node.id.toString().substring(0, 1))
    navigation.navigate('SubDetails', { value: parentId, subvalue: node.id })
  }

  const expandItem = (value) => {
    const updatedArr = searchResults.map((item) => {
      if (item.id === value) {
        return {
          ...item,
          expanded: !item.expanded
        }
      }
      return item
    })
    setSearchResults(
      updatedArr
    )
  }

  const ExpandedContent = ({ child, sectionColor, showName }) => (
    <View style={{ justifyContent: 'center' }}>
      {child.special_instruction_header && (
        <ItemDetailHeader headerText={child.special_instruction_header} />
      )}

      {showName && (child.child_detail_name || child.child_name) && (
        <ItemDetailsDesc childDetailDesc={child.child_detail_name || child.child_name} borderColor={{ borderColor: sectionColor }} textColor={{ color: sectionColor }} />
      )}

      {(child.child_detail_desc || child.child_desc) && (
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 20, justifyContent: 'center', marginTop: 5 }}>{child.child_detail_desc || child.child_desc}</Text>
        </View>
      )}

      {child.child_bullets && (
        <View style={{ alignItems: 'left', justifyContent: 'left', paddingLeft: 5, marginTop: 10 }}>
          {child.child_bullets.map((bullet, idx) => (
            <View style={{ flexDirection: 'column', justifyContent: 'left' }} key={idx.toString()}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'left' }}>{bullet.title}</Text>
              <Text style={{ fontSize: 20, textAlign: 'left' }}>{bullet.subtext}</Text>
            </View>
          ))}
        </View>
      )}      

      {child.special_instruction_footer && (
        <ItemDetailFooter footerText={child.special_instruction_footer} />
      )}
    </View>
  )

  const ItemDetails = ({ item, backgroundColor, onPress, textColor }) => (
    <TouchableOpacity onPress={onPress} style={[styles.SubmitButtonStyle, backgroundColor = backgroundColor]}>
      <Text style={[styles.title, textColor]}>{item.child_name}</Text>
      <MaterialIcons name={item.expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={30} style={{ color: 'white' }} />
    </TouchableOpacity>
  )

  const Item = ({ item, backgroundColor, onPress, textColor }) => (
    <View>
      <TouchableOpacity onPress={onPress} style={[styles.SubmitButtonStyle, backgroundColor = backgroundColor]}>
        <Text style={[styles.title, textColor]}>{item.name || item.section_name}</Text>
        <MaterialIcons name='keyboard-arrow-down' size={30} style={{ color: 'white' }} />
      </TouchableOpacity>
    </View>
  )

  const EmptyList = () => {
    return (
      <View><Text style={styles.title}>No Data Found</Text></View>
    )
  }

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

  const renderNodes = ({ item, index }) => {
    const backgroundColor = item.hexvalue || item.section_hexvalue
    const color = '#fff'
    // if it's a child node (has a childId), show the node so it will expand when clicked
    // within this - if there are sub children, then add those to the expandable content
    if (item.child_id) {
      let expandableContents = []

      if (item.children) {
        expandableContents = item.children.map((child, index) => {
          return (
            <ExpandedContent child={child} key={(child.child_id + index).toString()} sectionColor={backgroundColor} showName={true} />
          )
        })
      } else {
        expandableContents = [<ExpandedContent child={item} key={(item.child_id + index).toString()} sectionColor={backgroundColor} showName={false} />]
      }

      return (
        <View key={item.child_id.toString()}>
          <ItemDetails
            item={item}
            onPress={() => expandItem(item.child_id)}
            backgroundColor={{ backgroundColor }}
            textColor={{ color }}
          />
          {!!item.expanded && (
            <View style={styles.TextComponentStyle}>{expandableContents}</View>
          )}
        </View>
      )
    // if it's a top level node, show the node so that it will nav to sections when clicked
    // Or if it's a section node, show the node so that it will nav to children when clicked
    } else {
      // if there are children of the node, have the node navigate to the sub layout page for that node
      return (
        <Item
          item={item}
          onPress={() => showSubDetails(item)}
          backgroundColor={{ backgroundColor }}
          textColor={{ color }}
        />
      )
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        editable
        style={{ 
          width: '100%',
          borderRadius: 5, 
          height: 70, 
          backgroundColor: 'white',
          paddingRight: 8,
          fontSize: 20,
          paddingLeft: 8
        }}
        placeholder='Search'
        maxLength={40}
        autoCorrect={false}
        autoFocus={true}
        onChangeText={onSearchInputChanged}
      />
      
      {resultsLoading && (
        <ActivityIndicator
          animating={resultsLoading}
          color='#96c9dc'
          size='large'
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            height: 80
          }}
        />
      )}

      {searchResults && searchResults.length > 0 && (
        <View style={[styles.container, { flexDirection: 'column '}]}>
          <FlatList
            data={searchResults}
            renderItem={({ item, index }) => renderNodes({ item, index })}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={EmptyList}
          />
        </View>
      )}

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  subtitleView: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#bebebe',
    width: Dimensions.get('window').width
  },
  itemStyle: {
    fontSize: 20,
    color: '#2a2a2a',
    marginHorizontal: 10,
    padding: 10
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#545454',
    color: '#000',
    padding: 5,
    width: 120,
    justifyContent: 'center',
    borderRadius: 5,
    fontWeight: 'bold',
    margin: 5
  },
  oddItem: {
    backgroundColor: '#A0A0A0'
  },
  evenItem: {
    backgroundColor: '#D3D3D3'
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
