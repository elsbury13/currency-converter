
/* jsonp function, (c) Przemek Sobstel 2012, License: MIT, https://github.com/sobstel/jsonp.js */
var $jsonp = (function(){
  var that = {}

  that.send = function(src, options) {
    options = options || {}
    var callbackName = options.callbackName || 'callback'
    var onSuccess = options.onSuccess || function(){}
    var onTimeout = options.onTimeout || function(){}
    var timeout = options.timeout || 10

    var timeoutTrigger = window.setTimeout(function(){
      window[callbackName] = function(){}
      onTimeout()
    }, timeout * 1000)

    window[callbackName] = function(data){
      window.clearTimeout(timeoutTrigger)
      onSuccess(data)
    }

    var script = document.createElement('script')
    script.type = 'text/javascript'
    script.async = true
    script.src = src

    document.getElementsByTagName('head')[0].appendChild(script)
  }
  return that
})()

var countryList = [
  {name: 'ARS'},
  {name: 'AUD'},
  {name: 'BRL'},
  {name: 'CAD'},
  {name: 'CLP'},
  {name: 'CNY'},
  {name: 'CZK'},
  {name: 'DKK'},
  {name: 'EUR'},
  {name: 'FJD'},
  {name: 'GBP'},
  {name: 'HNL'},
  {name: 'HKD'},
  {name: 'HUF'},
  {name: 'ISK'},
  {name: 'INR'},
  {name: 'IDR'},
  {name: 'ILS'},
  {name: 'JPY'},
  {name: 'KRW'},
  {name: 'MYR'},
  {name: 'MXN'},
  {name: 'NZD'},
  {name: 'NOK'},
  {name: 'PKR'},
  {name: 'PLN'},
  {name: 'RUB'},
  {name: 'SGD'},
  {name: 'ZAR'},
  {name: 'SEK'},
  {name: 'CHF'},
  {name: 'TWD'},
  {name: 'THB'},
  {name: 'TRY'},
  {name: 'USD'},
  {name: 'VND'},
]

var curData = [ ]

function isoDateReviver  (value) {
  if ( typeof value === 'string' ) {
    var a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)(?:([+-])(\d{2}):(\d{2}))?Z?$/.exec( value );
    if ( a ) {
      var utcMilliseconds = Date.UTC( +a[ 1 ], +a[ 2 ] - 1, +a[ 3 ], +a[ 4 ], +a[ 5 ], +a[ 6 ] )
      return new Date( utcMilliseconds )
    }
  }
  return value
}

var isoDate = new Date(Date.now()).toISOString()
curData.UTCdate = 'Requested on: ' + isoDateReviver( isoDate )

var CurrencyEX = React.createClass( {
  getInitialState: function () {
    return {
      firstListVisible: false,
      secondListVisible: false,
      selectedPair: false,
      curToChange: '',
      curToRev: '',
      firstListSelected: false,
      secondListSelected: false,
    }
  },
  getInfo: function (firstListSelected, secondListSelected) {
    var value = firstListSelected.name + '/' + secondListSelected.name
    var uri = 'https://currency-api.appspot.com/api/' + value + '.jsonp?callback=handleStuff'
    $jsonp.send( uri, {
      callbackName: 'handleStuff',
      onSuccess: json => {
        var res = json
        curData.data = res
        var temp = 1 / res.rate
        var reverse = temp.toFixed( 7 )
        this.setState( {
          rate: res.rate,
          source: res.source,
          target: res.target,
          reverse: reverse
        } )
      },
      onTimeout: function(){
        console.log('timeout!')
      },
      timeout: 5
    })
  },
  selectFirstListSelected: function(item) {
    this.setState( { firstListSelected: item })
    this.state.secondListSelected && this.getInfo(item, this.state.secondListSelected)
    this.state.revTargetCur = ''
    this.state.targetCur = ''
    this.state.curToChange = ''
    this.state.curToRev = ''
  },
  selectSecondListSelected: function(item) {
    this.setState( { secondListSelected: item })
    this.state.firstListSelected && this.getInfo(this.state.firstListSelected, item)
  },
  showFirstList: function () {
    this.setState( { firstListVisible: true } )
    document.addEventListener( 'click', this.hide )
  },
  showSecondList: function () {
    this.setState( { secondListVisible: true } )
    document.addEventListener( 'click', this.hide )
  },
  hide: function () {
    this.setState( { firstListVisible: false } )
    this.setState( { secondListVisible: false } )
    document.removeEventListener( 'click', this.hide )
  },
  sourceToTarget: function ( evt ) {
    this.setState( { curToChange: evt.target.value } )
    var conve = this.state.rate
    var elem = document.getElementById( "sourceCur" ).value
    var multiply = elem * conve
    var trim = multiply.toFixed( 2 )
    this.setState( { targetCur: trim } )
  },
  targetToSource: function ( evt ) {
    this.setState( { curToRev: evt.target.value } )
    var revConve = this.state.rate
    var revElem = document.getElementById( "revSourceCur" ).value
    var revMultiply = revElem / revConve
    var revTrim = revMultiply.toFixed( 2 )
    this.setState( { revTargetCur: revTrim } )
  },
  render: function () {
    let bothSelected = this.state.firstListSelected && this.state.secondListSelected
    return <div>
      <div className={ 'dropdown-container' + (this.state.firstListVisible ? ' show' : '') }>
        <div className={ 'dropdown-display' + (this.state.firstListVisible ? ' clicked' : '') } onClick={ this.showFirstList }>
          <span>{ this.state.firstListSelected }</span>
          <i className='fa fa-angle-down'></i>
        </div>
        <div className='dropdown-list'>
          <div>{ this.renderListItems(this.selectFirstListSelected) }</div>
        </div>
      </div>
      <div className={ 'dropdown-container' + (this.state.secondListVisible ? ' show' : '') }>
        <div className={ 'dropdown-display' + (this.state.secondListVisible ? ' clicked' : '') } onClick={ this.showSecondList }>
          <span>{ this.state.secondListSelected }</span>
          <i className='fa fa-angle-down'></i>
        </div>
        <div className='dropdown-list'>
          <div>{ this.renderListItems(this.selectSecondListSelected) }</div>
        </div>
      </div>
      <div>
        <span className='datapeg'>
          <div className={ (bothSelected ? 'view-display-clicked' : 'view-display') }>
            { curData.UTCdate }
          </div>
          <div className={ (bothSelected ? 'view-display-clicked' : 'view-display') }> Rate:
            { this.state.rate }
          </div>
          <div className={ (bothSelected ? 'view-display-clicked' : 'view-display') }> 1
            { this.state.source } = { this.state.rate }{ this.state.target }
          </div>
          <div className={ (bothSelected ? 'view-display-clicked' : 'view-display') }> 1
            { this.state.target } = { this.state.reverse }{ this.state.source }
          </div>
        </span>
      </div>
      <div className='converter'>
        <p>Currency Converter</p>
        <table>
          <tr>
            <td>
              <span id='targetCur'>{ this.state.targetCur }</span>
            </td>
            <td>
              <span>{ this.state.target }</span>
            </td>
            <td>
              <input
                id='sourceCur'
                type='text'
                value={ this.state.curToChange }
                onChange={ this.sourceToTarget }
              />
            </td>
            <td>
              <span>{ this.state.source }</span>
            </td>
          </tr>
          <tr>
            <td>
              <span id='revTargetCur'>{ this.state.revTargetCur }</span>
            </td>
            <td>
              <span>{ this.state.source }</span>
            </td>
            <td>
              <input
                id='revSourceCur'
                type='text'
                value={ this.state.curToRev }
                onChange={ this.targetToSource }
              />
            </td>
            <td>
              <span>{ this.state.target }</span>
            </td>
          </tr>
        </table>
      </div>
    </div>
  },
  renderListItems: function (onclick) {
    var items = [ ]
    for (var i = 0; i < this.props.list.length; i++) {
      var item = this.props.list[ i ];
      items.push(
        <div onClick={onclick.bind(null, item)}>
          <span>{ item.name }< /span>
        </div>
      )
    }
    return items
  }
})

React.render( < CurrencyEX list={ countryList } />, document.getElementById( 'container' ) )
