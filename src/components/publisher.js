import React, { Component } from 'react';
import Blockie from '../dapparatus/blockie'
import Scaler from '../dapparatus/scaler'
import { Dropdown } from 'semantic-ui-react'
import Particles from './particles.js';
import Backarrow from '../back-arrow.png'
import Loader from "../loader.gif"

class Publisher extends Component {
  constructor(props) {
    super(props);
    this.state = {
      toAddress: props.account,
      tokenAmount: 1000,
      timeAmount: 1,
      timeType:"months",
      tokenAddress:"KT1FKDqbqQ6E25ze5XXTbRSzMKhu11neuR7y",
      gasPrice:25,
      loading: false
    };
  }
  handleInput(e,data){
    console.log("INPUT",e,data)
    let update = {}
    if(data){
      update[data.name] = data.value
      if(data.name=="tokenAddress" && !data.value){
        update.tokenAmount=""
        update.gasPrice=""
        update.timeAmount=""
      }else{
        if(this.state.tokenAmount==""){
          update.tokenAmount=1000
        }
        if(this.state.gasPrice==""){
          update.gasPrice=25
        }
        if(this.state.timeAmount==""){
          update.timeAmount=1
        }
      }
    }else{
      update[e.target.name] = e.target.value
    }
    this.setState(update,()=>{
    //  this.updateUrl()
    })
  }
  updateUrl(){
    let url = window.location.origin+window.location.pathname+
      "?timeAmount="+this.state.timeAmount+
      "&timeType="+this.state.timeType
      if(this.state.toAddress) url+="&toAddress="+this.state.toAddress
      if(this.state.tokenAddress) url+="&tokenAddress="+this.state.tokenAddress
      if(this.state.tokenAmount) url+="&tokenAmount="+this.state.tokenAmount
      if(this.state.gasPrice) url+="&gasPrice="+this.state.gasPrice

    this.setState({url:url})
  }
  componentDidMount() {
    let {contracts} = this.props
    console.log("contracts",contracts)
    this.setState({
      isLoaded: true,
      items: [ {
        address: this.props.contracts.WasteToken._address,
        name: "WasteCoin",
        symbol: "WC",
      } ]
    })
  }

  render() {

    let {coins} = this.props
    let {toAddress,tokenAddress,tokenAmount,timeType,timeAmount,gasPrice,email} = this.state

    let coinOptions = []

    let loading = ""
    if(this.state.loading){
      loading = (
        <img src={Loader} style={{maxWidth:50,verticalAlign:"middle"}} />
      )
    }

    for(let i = 0; i < coins.length; i++){
      coinOptions.push({
         key: coins[i].address,
         value: coins[i].address,
         image:{
           avatar : true,
           src    : coins[i].imageUrl,
         },
         text: coins[i].symbol
       })
    }

    let monthOptions = [
        {key: 'months', value: 'months', text: 'Month(s)'},
        {key: 'days', value: 'days', text: 'Day(s)'},
        {key: 'hours', value: 'hours', text: 'Hour(s)'},
        {key: 'minutes', value: 'minutes', text: 'Minutes(s)'},
    ]

    return (
        <Scaler config={{startZoomAt:800,origin:"50px 50px"}}>
          <Particles left={-1300} opacity={0.65} />
          <h1 style={{marginTop:50}}>Subscriptions Parameters</h1>
          <div className="form-field">
            <label>To Address:</label>
            <Blockie
              address={toAddress}
              config={{size:3}}
            />
            <input type="text" style={{width: '415px'}} name="toAddress" value={toAddress} onChange={this.handleInput.bind(this)} />
          </div>
          <div className="form-field">
            <label>Token:</label>
              <Dropdown
                selectOnNavigation={false}
                selection
                value={tokenAddress}
                name='tokenAddress'
                options={coinOptions}
                placeholder='Choose Token'
                onChange={this.handleInput.bind(this)}
              />

             <label>Amount:</label>
             <input type="text" name="tokenAmount" value={tokenAmount} onChange={this.handleInput.bind(this)} />
          </div>
          <div className="form-field">
            <label>Recurring Every:</label>
            <input type="text" name="timeAmount" value={timeAmount} onChange={this.handleInput.bind(this)} />
            <Dropdown
              selectOnNavigation={false}
              selection
              value={timeType}
              name="timeType"
              onChange={this.handleInput.bind(this)}
              options={monthOptions}
              placeholder='Choose Term'
            />
          </div>
          <div className="form-field">
            <label>Gas Price:</label>
            <input
              type="text" name="gasPrice" value={gasPrice} onChange={this.handleInput.bind(this)}
            />
          </div>
          <div className="form-field">
            <label>Email (optional):</label>
            <input
              type="text" name="email" style={{width:240}} value={email} onChange={this.handleInput.bind(this)}
            />
          </div>
          {loading}
          <button size="2" style={{marginTop:50}} onClick={()=>{
              this.setState({loading:true})
              this.props.deploySubscription(toAddress,tokenAddress,tokenAmount,timeType,timeAmount,gasPrice,email)
            }}>
            Deploy Subscription Contract
          </button>

          <div style={{marginTop:90,cursor:"pointer",width:100}} onClick={()=>{this.props.setMode("")}}>
            <img style={{verticalAlign:'middle'}} src={Backarrow}/> <span style={{fontSize:14}}>Previous</span>
          </div>
        </Scaler>
    );
  }
}

export default Publisher;