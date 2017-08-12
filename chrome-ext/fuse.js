const { FuseBox } = require("fuse-box");
const fuse = FuseBox.init({
    homeDir: "src",
    output: "dev_tools/WSInspectorPanel/$name.js",
    tsConfig: "tsconfig.json"
});
fuse.bundle("app")
    .instructions(`>index.tsx`);

fuse.run();