import React, { Component } from 'react';
import axios from 'axios';
import moment from 'moment';


const Header = props => {
  return (
    <tr>
      <td className="divider" colSpan="7">{props.item.title}</td>
    </tr>
  );
}

const Item = props => {
  const { item } = props;
  const length = item.length === 0 ? '' : (item.length < 60 ? ':' + item.length : item.length / 60);
  let isSong = item.item_type === 'song' ? true : false;
  return (
    <tr className="rowClass">
      <td className="time">{item.times && item.times.join(' • ')}</td>
      <td className="length">{length}</td>
      <td className={`event ${isSong && ' song'}`}><div>{isSong && item.song_info.order + ') '}{item.title}</div><span>{item.item_notes && item.item_notes.person}</span></td>
      <td className={`sound ${isSong && ' song'}`}>{item.item_notes.sound}</td>
      <td className={`video ${isSong && ' song'}`}>{item.item_notes.video}</td>
      <td className={`lights ${isSong && ' song'}`}>{item.item_notes.lights}</td>
      <td className={`notes ${isSong && ' song'}`}>{item.item_notes.notes}</td>
    </tr>
  );
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accountId: process.env.REACT_APP_PCO_ACCOUNT_ID || null,
      planId: process.env.REACT_APP_PCO_PLAN_ID || null,
      appId: process.env.REACT_APP_PCO_APP_ID || null,
      appSecret: process.env.REACT_APP_PCO_APP_SECRET || null,
      plan: null,
      times: null,
      items: null,
      notes: null,
      people: null,
      itemNotes: null,
      itemsArr: null,
      timesArr: null,
      date: null,
      seriesTitle: null,
      title: null,
      speaker: null,
      producer: null,
      error: null
    };
    this._getPlan = this._getPlan.bind(this);
  }

  componentDidMount() {
    const { accountId, planId, appId, appSecret } = this.state;
    if (accountId && planId && appId && appSecret) {
      this._getPlan();
    } else {
      this.setState({ error: 'Missing credentials' });
    }
  }

  _getPlan = () => {
    const { accountId, planId, appId: username, appSecret: password } = this.state;
    const baseUrl = 'https://api.planningcenteronline.com/services/v2/service_types/';

    const auth = { auth: { username, password } };
    const planUrl = baseUrl + accountId + '/plans/' + planId;
    const timesUrl = planUrl + '/plan_times';
    const itemsUrl = planUrl + '/items?per_page=100&include=item_notes';
    const notesUrl = planUrl + '/notes';
    const peopleUrl = planUrl + '/team_members';
    axios.all(
      [
        axios.get(planUrl, auth),
        axios.get(timesUrl, auth),
        axios.get(itemsUrl, auth),
        axios.get(notesUrl, auth),
        axios.get(peopleUrl, auth)
      ]
    ).then(axios.spread((planResponse, timesResponse, itemsResponse, notesResponse, peopleResponse) => {
      this.setState({
        plan: planResponse.data,
        times: timesResponse.data,
        items: itemsResponse.data,
        notes: notesResponse.data,
        people: peopleResponse.data
      });
      if (this.state.plan && this.state.notes && this.state.people) {
        this._setInfo();
      }
      if (this.state.times) {
        this._setTimes();
      }
      if (this.state.items) {
        this._setItemNotes();
        this._setItems();
      }
    })).catch((error) => {
      this.setState({ error: error.message });
      console.log(error);
    });
  }

  _setInfo = () => {
    const { plan, notes, people } = this.state;
    const speaker = notes.data.filter(note => note.attributes.category_name === 'Speaker')[0].attributes.content;
    const producer = people.data.filter(person => person.attributes.team_position_name === 'Producer')[0].attributes.name;
    this.setState({
      date: plan.data.attributes.dates,
      seriesTitle: plan.data.attributes.series_title,
      title: plan.data.attributes.title,
      speaker,
      producer
    });
  }

  _setTimes = () => {
    const { times } = this.state;
    let timesArr = [];
    times.data.map(time => {
      if (time.attributes.time_type === 'service') {
        timesArr.push(moment(time.attributes.starts_at).format('X'));
      }
      return null;
    });
    this.setState({ timesArr });
  }

  // Iterate and set ITEMS NOTES
  _setItemNotes = () => {
    const { items } = this.state;
    let itemNotes = {};
    items.included.map(note => {
      itemNotes[note.id] = {
        id: note.id,
        type: note.attributes.category_name,
        content: note.attributes.content
      };
      return null;
    });
    this.setState({ itemNotes });
  }

  // Iterate and set ITEMS DATA
  _setItems = () => {
    const { items, itemNotes, timesArr } = this.state;
    let songCount = 0;
    let prevLength = 0;

    // Calculate pre-service length
    const preServiceLength = items.data
      .filter((item) => {
        return item.attributes.service_position === 'pre';
      }).map((item) => {
        return item.attributes.length;
      }).reduce((sum, item) => {
        return sum + item;
      });

    // Iterate items
    const itemsArr = items.data.map((item, index) => {

      // Iterate item notes
      let item_notes = {};
      item.relationships.item_notes.data.map(note => {
        let type = itemNotes[note.id]['type'].toLowerCase();
        let content = itemNotes[note.id]['content'];
        item_notes[type] = content;
        return null;
      });

      // Calculate times
      let times = null;
      if (item.attributes.item_type !== 'header') {
        times = timesArr.map(time => {
          if (item.attributes.service_position === 'pre') {
            // Calculate pre-service times
            return moment(time, 'X').subtract(preServiceLength, 'seconds').format('h:mma');
          } else {
            // Calculate during and post-service times
            return moment(time, 'X').add(prevLength, 'seconds').format('h:mma');
          }
        });
        // Increment times
        if (item.attributes.service_position !== 'pre') {
          prevLength += item.attributes.length;
        }
      }

      let data = {
        id: item.id,
        sequence: item.attributes.sequence,
        item_type: item.attributes.item_type,
        service_position: item.attributes.service_position,
        length: item.attributes.length,
        title: item.attributes.title,
        item_notes,
        times
      };

      // Get song info
      if (item.attributes.item_type === 'song') {
        songCount++;
        let song_info = {
          order: songCount,
          length: item.attributes.length,
          song_title: item.attributes.title,
        };
        data['song_info'] = song_info;
      }


      // Return mapped data
      return data;

    });
    this.setState({ itemsArr });
  }

  render() {
    return this.state.error ? <h1>{this.state.error}</h1> : this.renderPlan();
  }

  renderPlan() {
    const { date, seriesTitle, title, speaker, producer, itemsArr } = this.state;
    return (
      <div>
        <table id="header" style={{ display: 'block' }}>
          <tbody>
            <tr>
              <td className="left">
                <img src="lcprintlogo.png" alt="" className="logo" />
              </td>
              <td className="date">{date}</td>
              <td colSpan="2" className="right" align="right">
                <table id="info">
                  <tbody>
                    <tr>
                      <td className="title">SPEAKER</td>
                      <td className="item">{speaker}</td>
                    </tr>
                    <tr>
                      <td className="title">SERIES</td>
                      <td className="item italic">{seriesTitle}</td>
                    </tr>
                    <tr>
                      <td className="title">SERMON</td>
                      <td className="item italic">{title}</td>
                    </tr>
                    <tr>
                      <td className="title">PRODUCER</td>
                      <td className="item">{producer}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        <table id="plan" style={{ display: 'block' }}>
          <thead>
            <tr>
              <th className="time">TIME</th>
              <th className="length"><i className="fa fa-clock-o"></i></th>
              <th className="event">EVENT &amp; PERSON</th>
              <th className="sound">SOUND</th>
              <th className="video">VIDEO</th>
              <th className="lights">LIGHTS</th>
              <th className="notes">NOTES</th>
            </tr>
          </thead>
          <tbody>
            {itemsArr && itemsArr.map(item => item.item_type === 'header' ? <Header key={item.id} item={item} /> : <Item key={item.id} item={item} />)}
          </tbody>
        </table>
      </div>
    );
  }
}

export default App;