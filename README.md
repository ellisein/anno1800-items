# Anno 1800 아이템 검색기

## 게임 데이터 추출 방법

1. [RDAExplorer](https://github.com/lysanntranvouez/RDAExplorer)를 설치합니다.
2. 게임 파일 위치(C:\Program Files (x86)\Steam\steamapps\common\Anno 1800)의 **maindata** 폴더에 있는 **data{number}.rda** 파일들을 RDAExplorer로 읽습니다.
3. 각 파일에서 **data/ui/2kimages/main/3dicons** 폴더가 있는 경우 추출합니다.
4. [textconv.exe](https://github.com/microsoft/DirectXTex/releases/download/feb2020/texconv.exe)를 설치합니다.
5. 추출한 **3dicons** 폴더에서 다음 명령을 실행합니다. 명령을 실행하면 모든 `*.dds` 파일이 `*.png` 파일로 변환됩니다.
```
FOR /R %%i IN (*.dds) DO (
    texconv -ft png -o "%%i\.." "%%i"
)
```
6. 가장 최근의 **data{number}.rda** 파일의 **data/config/export/main/asset/assets.xml**, **data/config/gui/texts_korean.xml** 파일을 추출합니다. 두 파일에 각각 게임 메타데이터, 한글 번역 정보가 저장되어 있습니다.
