import { Option, Select } from "@mui/joy";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useGlobalStore, useUserStore } from "../store/module";
import * as api from "../helpers/api";
import { validate, ValidatorConfig } from "../helpers/validator";
import useLoading from "../hooks/useLoading";
import Icon from "../components/Icon";
import toastHelper from "../components/Toast";
import AppearanceSelect from "../components/AppearanceSelect";
import "../less/auth.less";

const validateConfig: ValidatorConfig = {
  minLength: 4,
  maxLength: 320,
  noSpace: true,
  noChinese: true,
};

const Auth = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const globalStore = useGlobalStore();
  const userStore = useUserStore();
  const actionBtnLoadingState = useLoading(false);
  const systemStatus = globalStore.state.systemStatus;
  const mode = systemStatus.profile.mode;
  const [username, setUsername] = useState(mode === "dev" ? "demohero" : "");
  const [password, setPassword] = useState(mode === "dev" ? "secret" : "");

  useEffect(() => {
    userStore.doSignOut().catch();
  }, []);

  const handleUsernameInputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value as string;
    setUsername(text);
  };

  const handlePasswordInputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value as string;
    setPassword(text);
  };

  const handleSigninBtnsClick = async () => {
    if (actionBtnLoadingState.isLoading) {
      return;
    }

    const usernameValidResult = validate(username, validateConfig);
    if (!usernameValidResult.result) {
      toastHelper.error(t("common.username") + ": " + t(usernameValidResult.reason as string));
      return;
    }

    const passwordValidResult = validate(password, validateConfig);
    if (!passwordValidResult.result) {
      toastHelper.error(t("common.password") + ": " + t(passwordValidResult.reason as string));
      return;
    }

    try {
      actionBtnLoadingState.setLoading();
      await api.signin(username, password);
      const user = await userStore.doSignIn();
      if (user) {
        navigate("/");
      } else {
        toastHelper.error(t("message.login-failed"));
      }
    } catch (error: any) {
      console.error(error);
      toastHelper.error(error.response.data.error);
    }
    actionBtnLoadingState.setFinish();
  };

  const handleSignUpBtnsClick = async (role: UserRole) => {
    if (actionBtnLoadingState.isLoading) {
      return;
    }

    const usernameValidResult = validate(username, validateConfig);
    if (!usernameValidResult.result) {
      toastHelper.error(t("common.username") + ": " + t(usernameValidResult.reason as string));
      return;
    }

    const passwordValidResult = validate(password, validateConfig);
    if (!passwordValidResult.result) {
      toastHelper.error(t("common.password") + ": " + t(passwordValidResult.reason as string));
      return;
    }

    try {
      actionBtnLoadingState.setLoading();
      await api.signup(username, password, role);
      const user = await userStore.doSignIn();
      if (user) {
        navigate("/");
      } else {
        toastHelper.error(t("common.singup-failed"));
      }
    } catch (error: any) {
      console.error(error);
      toastHelper.error(error.response.data.error);
    }
    actionBtnLoadingState.setFinish();
  };

  const handleLocaleItemClick = (locale: Locale) => {
    globalStore.setLocale(locale);
  };

  return (
    <div className="page-wrapper auth">
      <div className="page-container">
        <div className="auth-form-wrapper">
          <div className="page-header-container">
            <div className="title-container">
              <img className="logo-img" src={systemStatus.customizedProfile.iconUrl} alt="" />
              <p className="logo-text">{systemStatus.customizedProfile.name}</p>
            </div>
            <p className="slogan-text">{t("slogan")}</p>
          </div>
          <div className={`page-content-container ${actionBtnLoadingState.isLoading ? "requesting" : ""}`}>
            <div className="form-item-container input-form-container">
              <span className={`normal-text ${username ? "not-null" : ""}`}>{t("common.username")}</span>
              <input className="input-text" type="text" value={username} onChange={handleUsernameInputChanged} required />
            </div>
            <div className="form-item-container input-form-container">
              <span className={`normal-text ${password ? "not-null" : ""}`}>{t("common.password")}</span>
              <input className="input-text" type="password" value={password} onChange={handlePasswordInputChanged} required />
            </div>
          </div>
          <div className="action-btns-container">
            {systemStatus?.host ? (
              <>
                {actionBtnLoadingState.isLoading && <Icon.Loader className="w-4 h-auto mr-2 animate-spin dark:text-gray-300" />}
                {systemStatus?.allowSignUp && (
                  <>
                    <button
                      className={`btn-text ${actionBtnLoadingState.isLoading ? "requesting" : ""}`}
                      onClick={() => handleSignUpBtnsClick("USER")}
                    >
                      {t("common.sign-up")}
                    </button>
                    <span className="mr-2 font-mono text-gray-200">/</span>
                  </>
                )}
                <button className={`btn-primary ${actionBtnLoadingState.isLoading ? "requesting" : ""}`} onClick={handleSigninBtnsClick}>
                  {t("common.sign-in")}
                </button>
              </>
            ) : (
              <>
                <button
                  className={`btn-primary ${actionBtnLoadingState.isLoading ? "requesting" : ""}`}
                  onClick={() => handleSignUpBtnsClick("HOST")}
                >
                  {t("auth.signup-as-host")}
                </button>
              </>
            )}
          </div>
          {!systemStatus?.host && <p className="tip-text">{t("auth.host-tip")}</p>}
        </div>
        <div className="flex flex-row items-center justify-center w-full gap-2">
          <Select
            className="!min-w-[9rem] w-auto whitespace-nowrap"
            startDecorator={<Icon.Globe className="w-4 h-auto" />}
            value={i18n.language}
            onChange={(_, value) => handleLocaleItemClick(value as Locale)}
          >
            <Option value="en">English</Option>
            <Option value="zh">中文</Option>
            <Option value="vi">Tiếng Việt</Option>
            <Option value="fr">French</Option>
            <Option value="nl">Nederlands</Option>
            <Option value="sv">Svenska</Option>
            <Option value="de">German</Option>
            <Option value="es">Español</Option>
          </Select>
          <AppearanceSelect />
        </div>
      </div>
    </div>
  );
};

export default Auth;
