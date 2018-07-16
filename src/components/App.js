import React from 'react';
import { connect } from 'react-redux';
import { Router, Route, Switch, Redirect } from 'react-router-dom';
import createHistory from 'history/createBrowserHistory';

import { setEnvVars } from '../actions/rootActions';
import DashboardPage from './pages/DashboardPage';
import PlanPage from './pages/PlanPage';


export const history = createHistory();

class AppRouter extends React.Component {
  componentWillMount() {
    this.props.setEnvVars({
      baseUrl: process.env.REACT_APP_PCO_BASE_URL,
      serviceTypes: process.env.REACT_APP_PCO_SERVICE_TYPES ? process.env.REACT_APP_PCO_SERVICE_TYPES.split(',') : null
    });
  }

  render() {
    return (
      <div>
        <Router history={history} >
          <div>
            <Switch>
              <Route path="/" component={DashboardPage} exact={true} />
              <Route path="/:typeId/:planId" component={PlanPage} />
              <Redirect from="*" to="/" />
            </Switch>
          </div>
        </Router>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  appId: state.appId,
  appSecret: state.appSecret,
  baseUrl: state.baseUrl
});

const mapDispatchToProps = (dispatch) => ({
  setEnvVars: data => dispatch(setEnvVars(data))
});

export default connect(mapStateToProps, mapDispatchToProps)(AppRouter);
