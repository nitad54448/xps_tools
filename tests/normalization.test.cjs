const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../XPS_normalize.html'),'utf8');
const source=html.slice(html.indexOf('function normalizeSelected()'),html.indexOf('// Rebuild a clean SheetJS workbook'));
function normalize(x,y,min='',max=''){
  const sheet={headers:['Energy','Signal'],columns:[x,y]},APP={sheetsData:{s:sheet},selectedCols:new Set(['s|1'])};
  const ctx=vm.createContext({APP,document:{getElementById:id=>({value:id==='bgMin'?min:max})},showToast(){},buildTree(){},drawChart(){},updateButtons(){}});
  vm.runInContext(source,ctx);ctx.normalizeSelected();return sheet;
}
test('200000-sample normalization reaches a unit maximum without argument-limit failure',()=>{
  const x=Array.from({length:200000},(_,i)=>i),sheet=normalize(x,x.map(i=>i+1));
  assert.equal(sheet.columns.length,3);assert.equal(sheet.columns[2].length,200000);
  assert.equal(sheet.columns[2][199999],1);assert.equal(sheet.columns[2][0],1/200000);
});
test('background subtraction, missing samples and non-positive spectra retain their behavior',()=>{
  const sheet=normalize([0,1,2,3],[2,2,null,6],'0','1');
  assert.deepEqual(Array.from(sheet.columns[2]),[0,0,null,1]);
  assert.equal(normalize([0,1],[-2,-1]).columns.length,2);
});
