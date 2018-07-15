import React from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import createHistory from 'history/createBrowserHistory';

import DashboardPage from './pages/DashboardPage';
import PlanPage from './pages/PlanPage';
import NotFoundPage from './pages/NotFoundPage';


export const history = createHistory();

class AppRouter extends React.Component {
  render() {
    return (
      <div>
        <Router history={history} >
          <div>
            <Switch>
              <Route path="/" component={DashboardPage} exact={true} />
              <Route path="/:planid" component={PlanPage} />
              <Route component={NotFoundPage} />
            </Switch>
          </div>
        </Router>
      </div>
    );
  }
}

export default AppRouter;
