!define MUI_LANGDLL_ALWAYSSHOW

!macro customInstall
  # NSISが保持する選択言語 ($LANGUAGE) を判定して、アプリの設定ファイルに書き出す
  # 1033 = 英語, 1041 = 日本語
  StrCmp $LANGUAGE 1033 0 +3
    CreateDirectory "$INSTDIR\resources"
    FileOpen $0 "$INSTDIR\resources\settings.json" w
    FileWrite $0 '{"language":"en"}'
    FileClose $0

  StrCmp $LANGUAGE 1041 0 +3
    CreateDirectory "$INSTDIR\resources"
    FileOpen $0 "$INSTDIR\resources\settings.json" w
    FileWrite $0 '{"language":"ja"}'
    FileClose $0
!macroend