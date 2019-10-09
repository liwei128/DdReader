function fakeClick(obj) {
   var ev = document.createEvent("MouseEvents");
   ev.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
   obj.dispatchEvent(ev);
}

function exportRaw(name, data) {
     var urlObject = window.URL || window.webkitURL || window;
     var export_blob = new Blob([data]);
     var save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
     save_link.href = urlObject.createObjectURL(export_blob);
     save_link.download = name;
     fakeClick(save_link);
}
var textSum = {};
var previouspage=0;
var pageSum=0;
//获取内容
function getBody(){
	var text = {};
	//1.抓取内容
	$(".one-page").each(function(){
		var pagenum =$(this).attr("pagenum"); 
		text[pagenum]=[];
		$(this).find("span").each(function(){
			var font = {}
			font.left=$(this).css("left").replace(/px/g,"");
			font.top=880-$(this).css("bottom").replace(/px/g,"");
			font.text=$(this).html();
			
			var index = text[pagenum].length;
			text[pagenum][index]=font;
		});
		$(this).find(".image>div").each(function(){
			var font = {}
			font.left=$(this).css("left").replace(/px/g,"");
			font.top=$(this).css("top").replace(/px/g,"");
			font.text="图片链接:"+$(this).find("img").attr("src");
			var index = text[pagenum].length;
			text[pagenum][index]=font;
		});
	});
	//2.排序
	for(var key in text) {
		var page = text[key];
		for(var i = 0;i<page.length;i++){
			for(var j= i+1;j<page.length;j++){
				if(Number(page[i].top)>Number(page[j].top)){
					var a = page[i];
					page[i] = page[j];
					page[j]  = a;
				}
				var hang = Number(page[i].top)-Number(page[j].top);
				if((hang<10&&hang>-10)&&(Number(page[i].left)>Number(page[j].left))){
					var a = page[i];
					page[i] = page[j];
					page[j]  = a;
				}
			}
		}
	}
	//3.拼接内容
	var lastNum = 0;
	for(var key in text) {
		if(!textSum[key]){
			textSum[key]=text[key];
			lastNum = key;
		}
	}
	previouspage = pageSum;
	pageSum = lastNum;
}

//输出
var isEnd=false;
function exportBody(){
	var body = "";
	for(var key in textSum) {
		body+=("\r\n\r\n------第"+key+"页------\r\n\r\n");
		pageNum = key;
		var page   = textSum[key];
		for(var i = 0;i<page.length;i++){
			body+=page[i].text;
			if(i<page.length-1){
				var hang = Number(page[i].top)-Number(page[i+1].top);
				if(hang<-10){
					body+="\r\n";
				}
			}
		}
	}
	var name = $("title").html()+".txt";
	exportRaw(name, body);
}
//目录抓取
function exportDirectory(){
	var directory = "";
	$(".tab-item a").each(function(){
		var title = $(this).html();
		title = title.replace(/<span>/g,":").replace(/<\/span>/g,"");
		directory+=(title+"\r\n");
	});
	var name = $("title").html()+"-目录.txt";
	exportRaw(name, directory);
}


$(".trun-right").click(function(){
    getBody();
	if(previouspage==pageSum){
		isEnd = true
		exportBody();
	}
});

setInterval(function(){
	if(!isEnd){
		$(".trun-right").trigger("click");
	}
},600);
exportDirectory();

