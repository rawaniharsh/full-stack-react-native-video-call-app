import IO from 'socket.io-client';
import Peer from 'react-native-peerjs';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {ID} from './authActions';

/** Web RTC */
import {mediaDevices} from 'react-native-webrtc';
import { ADD_STREAM, ALL_USERS, MY_STREAM } from './types';

//** API_URI */
export const API_URI = `http://localhost:5000`;

const peerServer = new Peer(undefined, {
  secure: false,
  config: {
    iceServers: [
      {
        urls: [
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
        ],
      },
    ],
  },
});

peerServer.on('error', console.log);

//** Socket Config */
export const socket = IO(`${API_URI}`, {
  forceNew: true,
});

socket.on('connection', () => console.log('Connection'));

export const joinGeneralRoom = () => async (dispatch) => {
  socket.emit('join-general-room', 'ajsdflajslkdfuaisfjwioerwqiheriyqw87ery');
};

export const userJoin = () => async (dispatch, getState) => {
  const allUserRoomID = 'ajsdadgdfhasfdfdfhgd';
  const roomID = 'active_room_id';
  const {user, allUsers} = getState().auth;

  // user exits
  socket.emit('user-exists', {user, socketID: socket.id});

  //user is found
  socket.on('user-found', (cuurentUser) => {
    if (cuurentUser) {
      socket.emit('update-user', {
        user,
        socketID: socket.id,
        allUserRoomID,
      });
    } else {
      socket.emit('user-join', {allUserRoomID, user, socketID: socket.id});
    }
  });

  //get all the users
  socket.on('activeUsers', (users) => {
    const eUsers = allUsers.map(({email}) => email);

    const fUsers = user
      .map(({email, name, socketID, uid, _id}) => {
        if (!eUsers.includes(email)) {
          return {
            email,
            name,
            socketID,
            uid,
            _id,
          };
        }
      })
      .filter((data) => data !== undefined);

      dispatch({type: ALL_USERS, payload: fUsers})
  });
};

// Stream Actions
export const joinStream = (stream) => async (dispatch, getState) => {
  const {user} = getState().auth;
  const roomID = "stream_general_room";

  dispatch({type: MY_STREAM, payload: stream});

  dispatch({
    type: ADD_STREAM,
    payload: {
      stream,
      ...user,
    }
  })
};

export const disconnect = () => async () => {
  // peerServer.disconnect();
};

export const stream = () => async (dispatch) => {
  let isFront = true;
  mediaDevices.enumerateDevices().then((sourceInfos) => {
    let videoSourceId;
    for (let i = 0; i < sourceInfos.length; i++) {
      const sourceInfo = sourceInfos[i];
      if (
        sourceInfo.kind == 'videoinput' &&
        sourceInfo.facing == (isFront ? 'front' : 'environment')
      ) {
        videoSourceId = sourceInfo.deviceId;
      }
    }

    mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          mandatory: {
            minWidth: 500,
            minHeight: 300,
            minFrameRate: 30,
          },
          facingMode: isFront ? 'user' : 'environment',
          optional: videoSourceId ? [{sourceId: videoSourceId}] : [],
        },
      })
      .then((stream) => {
        dispatch(joinStream(stream));
      })
      .catch((error) => {
        console.log(error);
      });
  });
};
