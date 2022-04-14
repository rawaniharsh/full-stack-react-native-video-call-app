import { ADD_STREAM, MY_STREAM } from '../actions/types';

const initialState = {};

export default (state = initialState, {type, payload}) => {
  switch (type) {
    case MY_STREAM:
      return {
        ...state,
        myStream: payload
      }
    case ADD_STREAM:
      const streams = state.streams.filter(
        ({email}) => payload.email !== email,
      )
      return {
        ...state,
        streams: [...streams, payload]
      }
    default:
      return state;
  }
};
