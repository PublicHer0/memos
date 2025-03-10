import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocationStore } from "../store/module";
import { memoSpecialTypes } from "../helpers/filter";
import Icon from "./Icon";
import "../less/search-bar.less";

const SearchBar = () => {
  const { t } = useTranslation();
  const locationStore = useLocationStore();
  const memoType = locationStore.state.query.type;
  const [queryText, setQueryText] = useState("");

  useEffect(() => {
    const text = locationStore.getState().query.text;
    setQueryText(text === undefined ? "" : text);
  }, [locationStore.getState().query.text]);

  const handleMemoTypeItemClick = (type: MemoSpecType | undefined) => {
    const { type: prevType } = locationStore.getState().query ?? {};
    if (type === prevType) {
      type = undefined;
    }
    locationStore.setMemoTypeQuery(type);
  };

  const handleTextQueryInput = (event: React.FormEvent<HTMLInputElement>) => {
    const text = event.currentTarget.value;
    setQueryText(text);
    locationStore.setTextQuery(text.length === 0 ? undefined : text);
  };

  return (
    <div className="search-bar-container">
      <div className="search-bar-inputer">
        <Icon.Search className="icon-img" />
        <input
          className="text-input"
          autoComplete="new-password"
          type="text"
          placeholder=""
          value={queryText}
          onChange={handleTextQueryInput}
        />
      </div>
      <div className="quickly-action-wrapper">
        <div className="quickly-action-container">
          <p className="title-text">{t("search.quickly-filter").toUpperCase()}</p>
          <div className="section-container types-container">
            <span className="section-text">{t("common.type").toUpperCase()}:</span>
            <div className="values-container">
              {memoSpecialTypes.map((type, idx) => {
                return (
                  <div key={type.value}>
                    <span
                      className={`type-item ${memoType === type.value ? "selected" : ""}`}
                      onClick={() => {
                        handleMemoTypeItemClick(type.value as MemoSpecType);
                      }}
                    >
                      {t(type.text)}
                    </span>
                    {idx + 1 < memoSpecialTypes.length ? <span className="split-text">/</span> : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
