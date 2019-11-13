import { ipcRenderer } from 'electron';
import { userbytokenid } from 'root/api/userbytokenid';
// tslint:disable: no-import-side-effect
import 'root/windows/home/home.css';
import Icon from 'root/statics/logo_03.png';

const Token: HTMLInputElement | null = document.getElementById(
  'token'
) as HTMLInputElement;
const TokenResponse = document.getElementById('TokenResponse');
const UserCredentials = document.getElementById('UserCredentials');
const StatusMessage = document.getElementById('StatusMessage');
const AppVersion = document.getElementById('AppVersion');
const titleIcon: HTMLImageElement | null = document.getElementById(
  'titleimg'
) as HTMLImageElement;
const minimizeButton = document.getElementById('minimize');

if (titleIcon) {
  titleIcon.src = Icon;
}

const TokenChecker = (token: string, elem: HTMLElement) => {
  elem.innerHTML = 'Checking token...';
  userbytokenid(token, 1).then(res => {
    //console.log(res);
    if (res.status === 'BAD_TOKEN') {
      elem.innerHTML = 'Bad Token!';
    } else if (res.status === 'NO_USER') {
      elem.innerHTML = 'No user found!';
    } else {
      Token.style.display = 'none';
      elem.innerHTML = `Current user: <strong>${res.status}</strong>`;
      ipcRenderer.send('token-input', { token, uid: res.data });
    }
  });
};

if (
  Token &&
  TokenResponse &&
  UserCredentials &&
  StatusMessage &&
  AppVersion &&
  minimizeButton
) {
  ipcRenderer.on('set-token', (e, arg) => {
    Token.value = arg;
    Token.style.display = 'none';
    TokenChecker(arg, TokenResponse);
  });

  ipcRenderer.on('set-creds', (e, arg) => {
    UserCredentials.innerHTML = `MTGA nick: <strong>${arg}</strong>`;
  });

  ipcRenderer.on('set-version', (e, arg) => {
    AppVersion.innerHTML = arg;
  });

  ipcRenderer.on('show-status', (e, arg) => {
    StatusMessage.innerHTML = arg.message;
    StatusMessage.style.color = arg.color;
  });

  // tslint:disable-next-line: no-any
  Token.addEventListener('input', (event: any) => {
    if (event && event.target && event.target.value) {
      TokenChecker(event.target.value, TokenResponse);
    }
  });

  minimizeButton.addEventListener('click', (event: any) => {
    ipcRenderer.send('minimize-me', 'test');
  });
}

const buttons = document.getElementsByClassName('button');
const tabs = document.getElementsByClassName('tab');

const tabclick = (event: any) => {
  const cl: HTMLElement = event.target;
  const activate = cl.getAttribute('data-activate');
  const cls = cl.classList;

  Array.from(buttons).forEach(el => {
    const elem = el as HTMLElement;
    const clas = elem.classList;
    clas.remove('active');
  });

  Array.from(tabs).forEach(el => {
    const elem = el as HTMLElement;
    elem.style.display = 'none';
  });
  if (activate) {
    const show = document.getElementById(activate);
    if (show) {
      show.style.display = 'block';
    }
    cls.add('active');
  }
};

Array.from(buttons).forEach(el => {
  el.addEventListener('click', tabclick);
});