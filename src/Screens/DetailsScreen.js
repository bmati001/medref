import { StatusBar } from 'expo-status-bar';
import React ,{useEffect, useState} from 'react';
import { StyleSheet, View , Text, Button, Dimensions} from 'react-native';
import SubLayout from '../Components/SubLayout';
import SubLayoutList from '../Components/SubLayoutList';

export default function DetailsScreen({navigation,route,props}) {
  
    const { value, subValue } = route.params;
    const hexagonSize = { x: 40, y: 40 };

    const [selectedValue, setSelectedValue] = useState();
    const [subSelectedValue, setSubSelectedValue] = useState();

    const height = Dimensions.get('window').height ;
    const width = Dimensions.get('window').width ;
    const upperViewHeight = height/6;

    useEffect( () =>{
      setSelectedValue(value);
      setSubSelectedValue(subValue);      
    },[props])

    const showDetails = (props) => { 
      setSelectedValue(props);
      setSubSelectedValue("0"); 
    }

    const showSubDetails = (props) => { // navigate to sub details screen
      navigation.navigate( "SubDetails" , {value : selectedValue, subvalue : props} )
    }

    const renderItems = () => { 
      if(selectedValue === undefined){        
        return(   
          <View style={[styles.container, {
            flexDirection: "column" 
          }]}>            
          </View>
        )
      }
      else{
        return(   
          <View style={[styles.container, {
            flexDirection: "column" 
          }]}>          
          <View style={{ flex: 1, backgroundColor: '#e5e5e5' }} >
          <SubLayout size={hexagonSize} flat={false} spacing={1.2} origin={{ x:  120, y: 120 }} showText={selectedValue} showDetails={showDetails}  height={upperViewHeight} />
        </View>
        <View style={{ flex: 5 , justifyContent :'space-around',  alignItems :'center'}} > 
           <SubLayoutList selectedValue={selectedValue} showSubDetails={showSubDetails} />   
        </View>
          </View>
        )
      }
    }
    
  return (   
    renderItems() 
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width : Dimensions.get('window').width
  }
});
