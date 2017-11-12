
/* jsonp function, (c) Przemek Sobstel 2012, License: MIT, https://github.com/sobstel/jsonp.js */
'use strict';

var $jsonp = (function () {
  var that = {};

  that.send = function (src, options) {
    options = options || {};
    var callbackName = options.callbackName || 'callback';
    var onSuccess = options.onSuccess || function () {};
    var onTimeout = options.onTimeout || function () {};
    var timeout = options.timeout || 10;

    var timeoutTrigger = window.setTimeout(function () {
      window[callbackName] = function () {};
      onTimeout();
    }, timeout * 1000);

    window[callbackName] = function (data) {
      window.clearTimeout(timeoutTrigger);
      onSuccess(data);
    };

    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = src;

    document.getElementsByTagName('head')[0].appendChild(script);
  };
  return that;
})();

var countryList = [{ name: 'ARS' }, { name: 'AUD' }, { name: 'BRL' }, { name: 'CAD' }, { name: 'CLP' }, { name: 'CNY' }, { name: 'CZK' }, { name: 'DKK' }, { name: 'EUR' }, { name: 'FJD' }, { name: 'GBP' }, { name: 'HNL' }, { name: 'HKD' }, { name: 'HUF' }, { name: 'ISK' }, { name: 'INR' }, { name: 'IDR' }, { name: 'ILS' }, { name: 'JPY' }, { name: 'KRW' }, { name: 'MYR' }, { name: 'MXN' }, { name: 'NZD' }, { name: 'NOK' }, { name: 'PKR' }, { name: 'PLN' }, { name: 'RUB' }, { name: 'SGD' }, { name: 'ZAR' }, { name: 'SEK' }, { name: 'CHF' }, { name: 'TWD' }, { name: 'THB' }, { name: 'TRY' }, { name: 'USD' }, { name: 'VND' }];

var curData = [];

function isoDateReviver(value) {
  if (typeof value === 'string') {
    var a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)(?:([+-])(\d{2}):(\d{2}))?Z?$/.exec(value);
    if (a) {
      var utcMilliseconds = Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4], +a[5], +a[6]);
      return new Date(utcMilliseconds);
    }
  }
  return value;
}

var isoDate = new Date(Date.now()).toISOString();
curData.UTCdate = 'Requested on: ' + isoDateReviver(isoDate);

var CurrencyEX = React.createClass({
  displayName: 'CurrencyEX',

  getInitialState: function getInitialState() {
    return {
      firstListVisible: false,
      secondListVisible: false,
      selectedPair: false,
      curToChange: '',
      curToRev: '',
      firstListSelected: false,
      secondListSelected: false
    };
  },
  getInfo: function getInfo(firstListSelected, secondListSelected) {
    var _this = this;

    var value = firstListSelected.name + '/' + secondListSelected.name;
    var uri = 'https://currency-api.appspot.com/api/' + value + '.jsonp?callback=handleStuff';
    $jsonp.send(uri, {
      callbackName: 'handleStuff',
      onSuccess: function onSuccess(json) {
        var res = json;
        curData.data = res;
        var temp = 1 / res.rate;
        var reverse = temp.toFixed(7);
        _this.setState({
          rate: res.rate,
          source: res.source,
          target: res.target,
          reverse: reverse
        });
      },
      onTimeout: function onTimeout() {
        console.log('timeout!');
      },
      timeout: 5
    });
  },
  selectFirstListSelected: function selectFirstListSelected(item) {
    this.setState({ firstListSelected: item });
    this.state.secondListSelected && this.getInfo(item, this.state.secondListSelected);
    this.state.revTargetCur = '';
    this.state.targetCur = '';
    this.state.curToChange = '';
    this.state.curToRev = '';
  },
  selectSecondListSelected: function selectSecondListSelected(item) {
    this.setState({ secondListSelected: item });
    this.state.firstListSelected && this.getInfo(this.state.firstListSelected, item);
  },
  showFirstList: function showFirstList() {
    this.setState({ firstListVisible: true });
    document.addEventListener('click', this.hide);
  },
  showSecondList: function showSecondList() {
    this.setState({ secondListVisible: true });
    document.addEventListener('click', this.hide);
  },
  hide: function hide() {
    this.setState({ firstListVisible: false });
    this.setState({ secondListVisible: false });
    document.removeEventListener('click', this.hide);
  },
  sourceToTarget: function sourceToTarget(evt) {
    this.setState({ curToChange: evt.target.value });
    var conve = this.state.rate;
    var elem = document.getElementById("sourceCur").value;
    var multiply = elem * conve;
    var trim = multiply.toFixed(2);
    this.setState({ targetCur: trim });
  },
  targetToSource: function targetToSource(evt) {
    this.setState({ curToRev: evt.target.value });
    var revConve = this.state.rate;
    var revElem = document.getElementById("revSourceCur").value;
    var revMultiply = revElem / revConve;
    var revTrim = revMultiply.toFixed(2);
    this.setState({ revTargetCur: revTrim });
  },
  render: function render() {
    var bothSelected = this.state.firstListSelected && this.state.secondListSelected;
    return React.createElement(
      'div',
      null,
      React.createElement(
        'div',
        { className: 'dropdowns' },
        React.createElement(
          'div',
          { className: 'dropdown-container' + (this.state.firstListVisible ? ' show' : '') },
          React.createElement(
            'div',
            { className: 'dropdown-display' + (this.state.firstListVisible ? ' clicked' : ''), onClick: this.showFirstList },
            React.createElement(
              'span',
              null,
              this.state.firstListSelected
            ),
            React.createElement('i', { className: 'fa fa-angle-down' })
          ),
          React.createElement(
            'div',
            { className: 'dropdown-list' },
            React.createElement(
              'div',
              null,
              this.renderListItems(this.selectFirstListSelected)
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'dropdown-container' + (this.state.secondListVisible ? ' show' : '') },
          React.createElement(
            'div',
            { className: 'dropdown-display' + (this.state.secondListVisible ? ' clicked' : ''), onClick: this.showSecondList },
            React.createElement(
              'span',
              null,
              this.state.secondListSelected
            ),
            React.createElement('i', { className: 'fa fa-angle-down' })
          ),
          React.createElement(
            'div',
            { className: 'dropdown-list' },
            React.createElement(
              'div',
              null,
              this.renderListItems(this.selectSecondListSelected)
            )
          )
        )
      ),
      React.createElement(
        'div',
        { className: 'converter' },
        React.createElement(
          'div',
          { className: 'content' },
          React.createElement(
            'label',
            null,
            this.state.source
          ),
          React.createElement('input', {
            id: 'sourceCur',
            type: 'text',
            value: this.state.curToChange,
            onChange: this.sourceToTarget
          }),

          React.createElement(
            'label',
            null,
            this.state.target
          ),
          React.createElement('input', {
            id: 'revSourceCur',
            type: 'text',
            value: this.state.curToRev,
            onChange: this.targetToSource
          })
        ),
        React.createElement(
          'div',
          { className: 'content' },

          React.createElement(
            'label',
            null,
            this.state.target
          ),
          React.createElement('input', {
            id: 'sourceCur',
            type: 'text',
            value: this.state.targetCur
          }),
          React.createElement(
            'label',
            null,
            this.state.source
          ),
          React.createElement('input', {
            id: 'revSourceCur',
            type: 'text',
            value: this.state.revTargetCur
          })
        )
      ),
      React.createElement(
        'span',
        { className: 'datapeg' },
        React.createElement(
          'div',
          { className: bothSelected ? 'view-display-clicked' : 'view-display' },
          curData.UTCdate
        ),
        React.createElement(
          'div',
          { className: bothSelected ? 'view-display-clicked' : 'view-display' },
          ' Rate:',
          this.state.rate
        ),
        React.createElement(
          'div',
          { className: bothSelected ? 'view-display-clicked' : 'view-display' },
          ' 1',
          this.state.source,
          ' = ',
          this.state.rate,
          this.state.target
        ),
        React.createElement(
          'div',
          { className: bothSelected ? 'view-display-clicked' : 'view-display' },
          ' 1',
          this.state.target,
          ' = ',
          this.state.reverse,
          this.state.source
        )
      )
    );
  },
  renderListItems: function renderListItems(onclick) {
    var items = [];
    for (var i = 0; i < this.props.list.length; i++) {
      var item = this.props.list[i];
      items.push(React.createElement(
        'div',
        { onClick: onclick.bind(null, item) },
        React.createElement(
          'span',
          null,
          item.name
        )
      ));
    }
    return items;
  }
});

React.render(React.createElement(CurrencyEX, { list: countryList }), document.getElementById('container'));
