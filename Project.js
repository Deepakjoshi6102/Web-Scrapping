//the purpose of this project is to extract information of worldcup 2019 from cricinfo and present 
//that in the form of excel and pdf scorecards
//to learn javascript and getting information 
//npm init -y
//npm install minimist
//npm install jsdom
//npm install axios
//npm install excel4node
//npm install pdf-lib

//node Project.js  --source=https://www.espncricinfo.com/series/icc-cricket-world-cup-2019-1144415/match-results --excel=Worldcup.csv --dataFolder=data
let parser=require("minimist");
let axios=require("axios");
let jsdom=require("jsdom");
let excel=require("excel4node");
let pdf=require("pdf-lib");
let fs=require('fs');
let path = require('path');

let input=parser(process.argv);
//download using axios
//read using jsdom
//make excel using excel4node
//make pdf using pdf-lib
let responsekapromise=axios.get(input.source);
responsekapromise.then(function(response){
    let html=response.data;
    let dom=new jsdom.JSDOM(html);//new feature
    let document=dom.window.document;
    let matches=[];
    let matchScoreDivs=document.querySelectorAll("div.match-score-block");
    for(let i=0;i<matchScoreDivs.length;i++){
        let match={

        };
    
    let namePs=matchScoreDivs[i].querySelectorAll("p.name");
    match.t1=namePs[0].textContent;
    match.t2=namePs[1].textContent;
    let ScoreSpan=matchScoreDivs[i].querySelectorAll("div.score-detail > span.score");
    match.t1s="";
    match.t2s="";
    if(ScoreSpan.length==2){
    match.t1s=ScoreSpan[0].textContent;
    match.t2s=ScoreSpan[1].textContent;
    }else if(ScoreSpan.length==1){
        match.t1s=ScoreSpan[0].textContent;
        match.t2s="";
    }else{
        match.t1s="";
        match.t2s="";
    }
    let spanResult=matchScoreDivs[i].querySelectorAll("div.status-text > span");
     match.result=spanResult[0].textContent;

    matches.push(match);
    }
    let matchesJSON=JSON.stringify(matches);
   fs.writeFileSync("matches.json",matchesJSON,'utf-8');
  
   let teams=[];
   for(let i=0;i<matches.length;i++){
    putTeamInTeamsArrayIfMissing 
    (teams,matches[i]);
       
   }
  for(let i=0;i<matches.length;i++){
    putMatchInAppropriateTeam(teams,matches[i])
  }
  let teamsJSON=JSON.stringify(teams);
   fs.writeFileSync("teams.json",teamsJSON,'utf-8');
   createExcelFile(teams);
   createFolders(teams);

})
function createFolders(teams)
{   
    if(fs.existsSync(input.dataFolder)==true){
         fs.rmdirSync(input.dataFolder,{recursive:true});
    }
    fs.mkdirSync(input.dataFolder);
    for(let i=0;i<teams.length;i++)
    {
    let teamFolder=path.join(input.dataFolder,teams[i].name);
    fs.mkdirSync(teamFolder);
    for(let j=0;j<teams[i].matches.length;j++){
        let matchFilename=path.join(teamFolder,teams[i].matches[j].vs );
      createScoreCard(teams[i].name,teams[i].matches[j],matchFilename);
        
    }
}
}
function createScoreCard(teamName,match,matchFilename)
    {
    //this fn creates pdf for match in appropriate folder with correct details
    //here we will use pdf-lib to create the pdf
    let t1=teamName;
    let t2=match.vs;
    let t1s=match.selfScore;
    let t2s=match.oppScore;
    let result= match.result;
      let originalBytes=fs.readFileSync("Template.pdf");
      let promisetoloadbytes=pdf.PDFDocument.load(originalBytes);
      promisetoloadbytes.then(function(pdfDoc){
          let page=pdfDoc.getPage(0);
          page.drawText(t1,{
            x:320,
            y:701,
            size: 8
        });
          page.drawText(t2,{
            x:320,
            y:687,
            size: 8
        });
        page.drawText(t1s,{
            x:320,
            y:673,
            size: 8
        });
        page.drawText(t2s,{
            x:320,
            y:659,
            size: 8
        });
          page.drawText(result,{
              x:320,
              y:645,
              size: 8
          });
          let promisetosave=pdfDoc.save();
          promisetosave.then(function(changesBytes){
              if(fs.existsSync(matchFilename + ".Pdf")==true){
                fs.writeFileSync(matchFilename + "1.Pdf",changesBytes);
              }else{
               fs.writeFileSync(matchFilename + ".Pdf",changesBytes);
              }
          })
      })
}
function createExcelFile(teams){
    let wb=new excel.Workbook();76

for(let i=0;i<teams.length;i++){
   let sheet= wb.addWorksheet(teams[i].name);
   sheet.cell(1,1).string("VS");
   sheet.cell(1,2).string("Self Score");
   sheet.cell(1,3).string("Opp Score");
   sheet.cell(1,4).string("Result");

  

   for(let j=0;j<teams[i].matches.length;j++){
       
       sheet.cell(2+j,1).string(teams[i].matches[j].vs);
       sheet.cell(2+j,2).string(teams[i].matches[j].selfScore);
       sheet.cell(2+j,3).string(teams[i].matches[j].oppScore);
       sheet.cell(2+j,4).string(teams[i].matches[j].result);

     }

}
wb.write(input.excel);
}

function putTeamInTeamsArrayIfMissing(teams, match) {
    let t1idx = -1;
    for (let i = 0; i < teams.length; i++) {
        if (teams[i].name == match.t1) {
            t1idx = i;
            break;
        }
    }

    if (t1idx == -1) {
        teams.push({
            name: match.t1,
            matches: []
        });
    }

    let t2idx = -1;
    for (let i = 0; i < teams.length; i++) {
        if (teams[i].name == match.t2) {
            t2idx = i;
            break;
        }
    }

    if (t2idx == -1) {
        teams.push({
            name: match.t2,
            matches: []
        });
    }
}

function putMatchInAppropriateTeam(teams, match) {
    let t1idx = -1;
    for (let i = 0; i < teams.length; i++) {
        if (teams[i].name == match.t1) {
            t1idx = i;
            break;
        }
    }

    let team1 = teams[t1idx];
    team1.matches.push({
        vs: match.t2,
        selfScore: match.t1s,
        oppScore: match.t2s,
        result: match.result
    });

    let t2idx = -1;
    for (let i = 0; i < teams.length; i++) {
        if (teams[i].name == match.t2) {
            t2idx = i;
            break;
        }
    }

    let team2 = teams[t2idx];
    team2.matches.push({
        vs: match.t1,
        selfScore: match.t2s,
        oppScore: match.t1s,
        result: match.result
    });
}
