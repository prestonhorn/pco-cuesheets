import React from 'react';
import { connect } from 'react-redux';
import { Router, Route, Switch, Redirect } from 'react-router-dom';
import createHistory from 'history/createBrowserHistory';

import DashboardPage from './pages/DashboardPage';
import PlanPage from './pages/PlanPage';


export const history = createHistory();

class AppRouter extends React.Component {
  render() {
    return (
      <div>
        <Router history={history} >
          <div>
            <Switch>
              <Route path ="/" component={DashboardPage} exact={true} />
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

export default connect(mapStateToProps)(AppRouter);
