import React from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import { Link } from 'react-router-dom';

import { setTypes, setPlans } from '../../actions/rootActions'
import Spinner from '../Spinner';


export class DashboardPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      loading: false
    };
    this._getData = this._getData.bind(this);
  }

  componentDidMount() {
    const { appId, appSecret, baseUrl, serviceTypes } = this.props;
    if (appId && appSecret && baseUrl && serviceTypes) {
      this._getData();
    } else {
      this.setState({ error: 'Missing credentials' });
    }
  }

  _getData = () => {
    const { appId, appSecret, baseUrl, serviceTypes } = this.props;
    const auth = { auth: { username: appId, password: appSecret } };
    const typeCalls = serviceTypes.map(type => axios.get(baseUrl + '/service_types/' + type, auth));
    const plansCalls = serviceTypes.map(type => axios.get(baseUrl + '/service_types/' + type + '/plans?filter=future', auth));
    this.setState({ loading: true });
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
      this.setState({ loading: false });
    }).catch((error) => {
      this.setState({ error: error.message, loading: false });
    });
  }

  render() {
    return (
      <div style={{ margin: '20px' }}>
        <h1>{this.state.loading && <Spinner />} Choose a plan:</h1>
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
                <li key={plan_index} style={{ marginLeft: '20px' }}><Link key={plan_index} to={`/${type.id}/${plan.id}`}>{plan.attributes.dates} - {plan.attributes.series_title} {plan.attributes.title}</Link> ({plan.id})</li>
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
  serviceTypes: state.serviceTypes,
  typesData: state.typesData,
  plansData: state.plansData
});

const mapDispatchToProps = (dispatch) => ({
  setTypes: data => dispatch(setTypes(data)),
  setPlans: data => dispatch(setPlans(data))
});

export default connect(mapStateToProps, mapDispatchToProps)(DashboardPage);
