import React from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import { Link } from 'react-router-dom';

import { setTypes, setPlans } from '../../actions/rootActions'


export class DashboardPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null
    };
    this._getData = this._getData.bind(this);
  }

  componentDidMount() {
    const { appId, appSecret, baseUrl, planTypes } = this.props;
    if (appId && appSecret && baseUrl && planTypes) {
      this._getData();
    } else {
      this.setState({ error: 'Missing credentials' });
    }
  }

  _getData = () => {
    const { appId, appSecret, baseUrl, planTypes } = this.props;
    const auth = { auth: { username: appId, password: appSecret } };
    const typeCalls = planTypes.map(type => axios.get(baseUrl + '/service_types/' + type, auth));
    const plansCalls = planTypes.map(type => axios.get(baseUrl + '/service_types/' + type + '/plans?filter=future', auth));
    axios.all(
      [...typeCalls, ...plansCalls]
    ).then(response => {
      let typesData = [];
      let plansData = [];
      response.map(item => {
        const data = item.data.data;
        data.type === 'ServiceType' ? typesData.push({ id: data.id, name: data.attributes.name }) : plansData.push(data);
        return null;
      });
      this.props.setTypes(typesData);
      this.props.setPlans(plansData);
    }).catch((error) => {
      this.setState({ error: error.message });
    });
  }

  render() {
    return (
      <div style={{ margin: '20px' }}>
        <h1>Choose a plan:</h1>
        {this.state.error && <pre>{this.state.error}</pre>}
        {this.renderList()}
      </div>
    );
  }

  renderList() {
    return (
      <div>
        {this.props.typesData && this.props.typesData.map((type, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <h3 key={index}>{type.name}</h3>
            <ul key={type.id}>
              {this.props.plansData && this.props.plansData[index].map((plan, plan_index) => (
                <li key={plan_index} style={{ marginLeft: '20px' }}><Link key={plan_index} to={`/${plan.id}`}>{plan.attributes.dates} - {plan.attributes.series_title} {plan.attributes.title}</Link> ({plan.id})</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  appId: state.appId,
  appSecret: state.appSecret,
  baseUrl: state.baseUrl,
  planTypes: state.planTypes,
  typesData: state.typesData,
  plansData: state.plansData
});

const mapDispatchToProps = (dispatch) => ({
  setTypes: data => dispatch(setTypes(data)),
  setPlans: data => dispatch(setPlans(data))
});

export default connect(mapStateToProps, mapDispatchToProps)(DashboardPage);
