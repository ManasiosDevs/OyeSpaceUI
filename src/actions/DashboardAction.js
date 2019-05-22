import { 
    DASHBOARD_SUBSCRIPTION,
    DASHBOARD_ASSOCIATION,
    DASHBOARD_UNITS,
    DASHBOARD_RESIDENT_LIST,
    DASHBOARD_PIE,
    DASHBOARD_UNITS_START,
    DASHBOARD_ASSOC_STOP
} from "./types";

export const getDashSub = () => {
    return (dispatch) => {
        fetch(`http://${global.oyeURL}/oyesafe/api/v1/Subscription/GetLatestSubscriptionByAssocID/${global.SelectedAssociationID}`
        , {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "X-OYE247-APIKey": "7470AD35-D51C-42AC-BC21-F45685805BBE",
            },
        })
        .then(response => response.json())
        .then(responseJson => {
            if(responseJson.success) {
                dispatch({
                    type: DASHBOARD_SUBSCRIPTION,
                    payload: responseJson
                })
            }
        })
        .catch( error => console.log(error))
    }
}

export const getDashAssociation = () => {
    return (dispatch) => {
        // console.log(`http://${global.oyeURL}/oyeliving/api/v1/GetAssociationListByAccountID/${global.MyAccountID}`)
        // fetch(`http://${global.oyeURL}/oyeliving/api/v1/GetAssociationListByAccountID/${global.MyAccountID}`
        fetch(`http://${global.oyeURL}/oyeliving/api/v1/GetAssociationListByAccountID/2180`
        , {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "X-Champ-APIKey": "1FDF86AF-94D7-4EA9-8800-5FBCCFF8E5C1",
            },
        })
        .then(response => response.json())
        .then((responseJson) => {
            console.log(responseJson)

            if(responseJson.success) {
                var count = Object.keys(responseJson.data.associationByAccount).length;
                let drop_down_data = [];
                let associationid = [];

                for(var i=0;i<count;i++){
                    let associationName = responseJson.data.associationByAccount[i].asAsnName;
                    drop_down_data.push({ value: associationName, name: associationName, id:i });
                    associationid.push({ id: responseJson.data.associationByAccount[i].asAssnID })
                }

                dispatch({ 
                    type: DASHBOARD_ASSOCIATION,
                    payload: { dropdown: drop_down_data, associationid }
                })
            } else {
                dispatch({ type: DASHBOARD_ASSOC_STOP })
            }
        })
        
        .catch(error => {
            dispatch({ type: DASHBOARD_ASSOC_STOP })
            console.log(error)
        })
    }
}

export const getDashUnits = (unit) => {
    return (dispatch) => {
        let sold =100;
        let unsold=100;
        let totalunits1=0;
        let sold2=0;
        let unsold2=0;
        let Residentlist=[];

        console.log(`http://${global.oyeURL}/oyeliving/api/v1/Unit/GetUnitListByAssocID/${unit}`)

        dispatch({ type: DASHBOARD_UNITS_START })

        fetch(`http://${global.oyeURL}/oyeliving/api/v1/Unit/GetUnitListByAssocID/${unit}`
        , {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "X-Champ-APIKey": "1FDF86AF-94D7-4EA9-8800-5FBCCFF8E5C1",
            },
        })
        .then(response => response.json())
        .then((responseJson) => {
            if(responseJson.success) {
                let count = Object.keys(responseJson.data.unit).length;
                let sold_data = [];
                let name=[];
                let sold1=0;
                let unsold1=0;
                let totalunits=0;
                Residentlist=name;

                for(var i=0;i<count;i++){
                    sold_data.push({ value: responseJson.data.unit[i].unOcStat });
                    var count1=Object.keys(responseJson.data.unit[i].owner).length;

                    for(var j=0;j<count1;j++) {
                        // this.setState({ownername:responseJson.data.unit[i].owner[j].uofName})
                        // this.setState({unitname:responseJson.data.unit[i].unUniName})
                        // this.setState({unitid:responseJson.data.unit[i].unUnitID})
                        // this.setState({uoMobile:responseJson.data.unit[i].owner[j].uoMobile});
                        // this.setState({admin:responseJson.data.unit[i].owner[j].acAccntID})
                        let ownername = responseJson.data.unit[i].owner[j].uofName;
                        let unitname = responseJson.data.unit[i].unUniName;
                        let unitid = responseJson.data.unit[i].unUnitID;
                        let uoMobile = responseJson.data.unit[i].owner[j].uoMobile;
                        let admin = responseJson.data.unit[i].owner[j].acAccntID

                        Residentlist.push({
                            name: ownername,
                            unit: unitname,
                            role: "Owner",
                            unitid:unitid,
                            uoMobile:uoMobile,
                            admin: admin
                        })
                    }

                    var count2=Object.keys(responseJson.data.unit[i].tenant).length;

                    for(var k=0;k<count2;k++) {

                        let tenantname = responseJson.data.unit[i].tenant[k].utfName;
                        let unitname = responseJson.data.unit[i].unUniName;

                        Residentlist.push({
                            name: tenantname,
                            unit: unitname,
                            role: "Tenant"
                        })
                    } 
                }

                for(var j=0;j< sold_data.length;j++) {
                    if(sold_data[j].value =='All Sold Units'
                    || sold_data[j].value =='All Sold Owner Occupied Units' 
                    || sold_data[j].value =='All Sold Tenant Occupied Units' 
                    || sold_data[j].value =='All Sold Vacant Units' )
                    {
                        sold1=sold1+1;
                    } else if (sold_data[j].value=='UnSold Vacant Units' 
                    || sold_data[j].value=='UnSold Tenant Occupied Units'
                     ||sold_data[j].value=='All Sold Vacants'
                    || sold_data[j].value=='NULL'
                    || sold_data[j].value==""
                    || sold_data[j].value =="Vacant") {
                        unsold1= unsold1+1;
                    }
                    totalunits++;
                }

                sold=((sold1/totalunits)*100).toFixed(0);
                unsold=((unsold1/totalunits)*100).toFixed(0);
                totalunits1=totalunits;
                sold2=sold1;
                unsold2=unsold1;

                let units = [];

                responseJson.data.unit.map((data, index) => {
                    units.push({ value: data.unUniName, name: data.unUniName, id: index })
                })

                dispatch({
                    type: DASHBOARD_UNITS,
                    payload: units
                })

                dispatch({
                    type: DASHBOARD_RESIDENT_LIST,
                    payload: Residentlist,
                })

                dispatch({
                    type: DASHBOARD_PIE,
                    payload: { prop: 'sold', value: sold }
                })

                dispatch({
                    type: DASHBOARD_PIE,
                    payload: { prop: 'sold2', value: sold2 }
                })

                dispatch({
                    type: DASHBOARD_PIE,
                    payload: { prop: 'unsold', value: unsold }
                })

                dispatch({
                    type: DASHBOARD_PIE,
                    payload: { prop: 'unsold2', value: unsold2 }
                })

            } else {
                dispatch({ type: DASHBOARD_UNITS_START })
            }
        })
        .catch(error => {
            console.log(error)
            dispatch({ type: DASHBOARD_UNITS_START })
        })
    }
}


unit=(unit)=>{
    fetch(`http://api.oyespace.com/oyeliving/api/v1/Unit/GetUnitListByAssocID/${unit}`
    , {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        "X-Champ-APIKey": "1FDF86AF-94D7-4EA9-8800-5FBCCFF8E5C1",
      },
    })
      .then(response => response.json())
      .then((responseJson) => {
        var count = Object.keys(responseJson.data.unit).length;
        let sold_data = [];
        let name=[];
        var sold1=0;
        var unsold1=0;
        var totalunits=0;
        Residentlist=name;
        for(var i=0;i<count;i++){
          // console.log("rohitbaba",responseJson.data.unit[i].unOcStat) // sold and unsold data 
          sold_data.push({ value: responseJson.data.unit[i].unOcStat });
          var count1=Object.keys(responseJson.data.unit[i].owner).length;
          
          for(var j=0;j<count1;j++)
          {    
              // var rolechange = "";
              this.setState({ownername:responseJson.data.unit[i].owner[j].uofName})
              this.setState({unitname:responseJson.data.unit[i].unUniName})
              this.setState({unitid:responseJson.data.unit[i].unUnitID})
              this.setState({uoMobile:responseJson.data.unit[i].owner[j].uoMobile});
              this.setState({admin:responseJson.data.unit[i].owner[j].acAccntID})

              Residentlist.push({
                name: this.state.ownername,
                unit: this.state.unitname,
                role: "Owner",
                unitid:this.state.unitid,
                uoMobile:this.state.uoMobile,
                admin:this.state.admin
              })
          }

          var count2=Object.keys(responseJson.data.unit[i].tenant).length;

          for(var k=0;k<count2;k++) {

              this.setState({tenantname:responseJson.data.unit[i].tenant[k].utfName})
              this.setState({unitname:responseJson.data.unit[i].unUniName})
              // console.log("tenantlist",this.state.tenantname)
              // console.log("unit",this.state.unitname)
              Residentlist.push({
                name: this.state.tenantname,
                unit: this.state.unitname,
                role: "Tenant"
              })
          }
         
              
        }
        // console.log("rohitpppppp",sold_data)
        for(var j=0;j< sold_data.length;j++)
        {
            if(sold_data[j].value =='Sold'|| sold_data[j].value =='SoldOwner Occupied Units' || sold_data[j].value =='Sold Tenant Occupied' || sold_data[j].value =='Sold Vacant' || sold_data[j].value=='All Sold Flats'|| sold_data[j].value =='All Occupied Units'||sold_data[j].value =='Sold Tenant Occupied Unit' || sold_data[j].value =='Sold-Owner Occupied' || sold_data[j].value =='Sold-Vacant Units'|| sold_data[j].value == "Sold-Owner Occupied Units"||sold_data[j].value == 'SelfOccupied'|| sold_data[j].value =='Tenant Occupied'|| sold_data[j].value == "Occupied" ||sold_data[j].value=="Sold Owner Occupied Unit"||sold_data[j].value=="Sold Owner Occupied Unit")
            {
                sold1=sold1+1;
            }
            else if (sold_data[j].value=='Unsold Vacant' || sold_data[j].value=='Unsold Tenant Occupied'||sold_data[j].value=='All Unsold Flats'||sold_data[j].value=='All Vacant Units' || sold_data[j].value=='NULL'|| sold_data[j].value=='UnSold Vacant'|| sold_data[j].value==""|| sold_data[j].value =="Vacant")
            {
                unsold1= unsold1+1;
            }
          totalunits++;
        }

        sold=((sold1/totalunits)*100).toFixed(0);
        unsold=((unsold1/totalunits)*100).toFixed(0);
        totalunits1=totalunits;
        sold2=sold1;
        unsold2=unsold1;

        let units = [];

        responseJson.data.unit.map((data, index) => {
          units.push({ value: data.unUniName })
        })

        this.setState({ dropdown1: units });

      })
      
      .catch(error=>console.log(error))
}