const defaultState = {
  baseUrl: null,
  serviceTypes: null,
  typesData: null,
  plansData: null,
  error: nul,
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case 'SET_ENV_VARS':
      return {
        ...state,
        baseUrl: action.data.baseUrl,
        serviceTypes: action.data.serviceTypes
      };
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
