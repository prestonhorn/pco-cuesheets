const {
  REACT_APP_PCO_APP_ID: appId,
  REACT_APP_PCO_APP_SECRET: appSecret,
  REACT_APP_PCO_BASE_URL: baseUrl,
  REACT_APP_PCO_PLAN_TYPES: planTypes
} = process.env;

const defaultState = {
  appId: appId || null,
  appSecret: appSecret || null,
  baseUrl: baseUrl || null,
  planTypes: planTypes ? planTypes.split(',') : null,
  error: null,
  typesData: null,
  plansData: null,
  plans: {}
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case 'SET_TYPES':
      return {
        ...state,
        typesData: action.data
      };
    case 'SET_PLANS':
      return {
        ...state,
        plansData: action.data
      };
    default:
      return state;
  }
};
