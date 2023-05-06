//Opções gerais
apenasQuadrantar=false;

//Cores
class Cor {
	r = 0;
	g = 0;
	b = 0;
	constructor(argHex="#000000") {
		//console.log("Criando cor "+argHex+"...");
		let hex='0x'+argHex.substring(1,3);
		this.r=+hex;
		hex='0x'+argHex.substring(3,5);
		this.g=+hex;
		hex='0x'+argHex.substring(5,7);
		this.b=+hex;
	}
	hex() {
		return "#"+
		this.r.toString(16).padStart(2,"0")+
		this.g.toString(16).padStart(2,"0")+
		this.b.toString(16).padStart(2,"0");
	}
}
var corDefaultPiso=127;
var corDefaultTeto=255;
var corDefaultStep=32;
var corDefaultR=corDefaultPiso;
var corDefaultG=corDefaultPiso;
var corDefaultB=corDefaultPiso;
var corDefaultRdir=1;
var corDefaultGdir=1;
var corDefaultBdir=1;
function gerarNovaCorDefault() {
	let corHex="#"+corDefaultR.toString(16,2).padStart(2,"0")+
	corDefaultG.toString(16,2).padStart(2,"0")+
	corDefaultB.toString(16,2).padStart(2,"0");
	console.log("Nova cor default: "+corHex);
	let jaUsada=false;
	if (obterLabelCor(corHex)!=null) {
		console.log("EITA QUE ESSA COR JÁ FOI");
		jaUsada=true;
	}
	corDefaultR+=corDefaultStep*corDefaultRdir;
	if (corDefaultR>corDefaultTeto) {
		corDefaultRdir=-1;
		corDefaultG+=(corDefaultR-corDefaultTeto)*corDefaultGdir;
		corDefaultR=corDefaultTeto;
	}
	if (corDefaultR<corDefaultPiso) {
		corDefaultRdir=1;
		corDefaultG+=(corDefaultPiso-corDefaultR)*corDefaultGdir;
		corDefaultR=corDefaultPiso;
	}
	if (corDefaultG>corDefaultTeto) {
		corDefaultGdir=-1;
		corDefaultB+=(corDefaultG-corDefaultTeto)*corDefaultBdir;
		corDefaultG=corDefaultTeto;
	}
	if (corDefaultG<corDefaultPiso) {
		corDefaultGdir=1;
		corDefaultB+=(corDefaultPiso-corDefaultG)*corDefaultBdir;
		corDefaultG=corDefaultPiso;
	}
	if (corDefaultB>corDefaultTeto) {
		corDefaultPiso--;
		corDefaultTeto--;
		corDefaultR=corDefaultPiso;
		corDefaultG=corDefaultPiso;
		corDefaultB=corDefaultPiso;
	}
	if (!jaUsada) {
		return new Cor(corHex);
	} else {
		return gerarNovaCorDefault();
	}
}

//Labels
const divListaLabels=document.getElementById("listaLabels");
var labels=[];
var numLabels=0;
//A classe Label possui um nome, uma cor e uma imagem de amostra, além de fazer também um elemento para a interface gráfica
class Label {
	nomeLabel = "label";
	corLabel = new Cor();
	imagemLabel = null;
	textoLabel = "";
	fieldset = null;
	legend = null;
	imagem = null;
	texto = null;
	constructor(argNomeLabel) {
		this.nomeLabel=argNomeLabel;
		this.criarFieldset();
	}
	criarFieldset() {
		this.fieldset=document.createElement("fieldset");
		this.legend=document.createElement("legend");
		this.imagem=document.createElement("canvas");
		this.texto=document.createElement("p");
		this.fieldset.appendChild(this.legend);
		this.fieldset.appendChild(this.imagem);
		this.fieldset.appendChild(this.texto);
		this.definirCor(this.corLabel.hex());
		this.legend.innerHTML=this.nomeLabel;
		this.definirImagem(this.imagemLabel);
		this.atualizarTexto();
	}
	definirCor(argCor) {
		if (this.fieldset!=null) {
			this.corLabel=new Cor(argCor);
			this.legend.style.backgroundColor=this.corLabel.hex();
			this.atualizarTexto();
		}
	}
	definirImagem(argImagem) {
		//console.log(argImagem);
		if (this.fieldset!=null) {
			this.imagemLabel=argImagem;
			if (this.imagemLabel!=null) {
				let ctx = this.imagem.getContext("2d");
				this.imagem.width=this.imagemLabel.naturalWidth;
				this.imagem.height=this.imagemLabel.naturalHeight;
				ctx.drawImage(this.imagemLabel,0,0);
				this.imagemLabel=this.imagemLabel;
				this.imagem.src=this.imagemLabel;
			}
			this.atualizarTexto();
		}
	}
	atualizarTexto() {
		this.textoLabel="";
		this.textoLabel+=""+
			this.imagem.width+" x "+
			this.imagem.height+"<br>";
		this.textoLabel+=""+
			this.corLabel.r+" "+
			this.corLabel.g+" "+
			this.corLabel.b+"<br>";
		this.texto.innerHTML=this.textoLabel;
	}
}
function criarNovoLabel(argNomeLabel="label") {
	let novoLabel=new Label(argNomeLabel);
	labels.push(novoLabel);
	numLabels++;
	divListaLabels.appendChild(novoLabel.fieldset);
	return novoLabel;
}
function obterLabelCor(argCor) {
	let labelEscolhido = null;
	for (var i=0; i<numLabels; i++) {
		if (labels[i].corLabel.hex()==argCor) {
			labelEscolhido=labels[i];
			break;
		}
	};
	return labelEscolhido;
}

//Analises
const divListaAnalises=document.getElementById("listaAnalises");
var analises=[];
var numAnalises=0;
class Analise {
	divAnalise=null;
	canvasFoto=null;
	canvasLabel=null;
	progresso=null;
	imagemAnalise=null;
	valorProgresso=0;
	constructor(argFoto) {
		this.criarDiv();
		this.preencherFotoAnalise(argFoto);
	}
	criarDiv() {
		this.divAnalise=document.createElement("div");
		this.divAnalise.classList.add("analise");
		this.canvasFoto=document.createElement("canvas");
		this.canvasFoto.classList.add("analise_foto");
		this.canvasFoto.width=256;
		this.canvasFoto.height=256;
		this.canvasLabel=document.createElement("canvas");
		this.canvasLabel.classList.add("analise_label");
		this.canvasLabel.width=256;
		this.canvasLabel.height=256;
		this.progresso=document.createElement("progress");
		this.progresso.max=100;
		this.progresso.value=0;
		this.divAnalise.appendChild(this.canvasFoto);
		this.divAnalise.appendChild(this.canvasLabel);
		this.divAnalise.appendChild(this.progresso);
	}
	preencherFotoAnalise(argFoto) {
		if (this.divAnalise!=null) {
			this.imagemAnalise=argFoto;
			if (this.imagemAnalise!=null) {
				let ctx = this.canvasFoto.getContext("2d");
				this.canvasFoto.width=this.imagemAnalise.naturalWidth;
				this.canvasFoto.height=this.imagemAnalise.naturalHeight;
				this.canvasLabel.width=this.imagemAnalise.naturalWidth;
				this.canvasLabel.height=this.imagemAnalise.naturalHeight;
				//argImagem.crossOrigin="Anonymous";
				//argImagem.src=source;
				ctx.drawImage(this.imagemAnalise,0,0);
				this.imagemAnalise=this.imagemAnalise;
				this.canvasFoto.src=this.imagemAnalise;
			}
		}
	}
	atualizarProgresso(argQtd) {
		this.valorProgresso+=argQtd;
		this.progresso.value=this.valorProgresso;
	}
	gerarProcesso() {
		let novoProcessoAnalise = new ProcessoAnalise(this,0,0,this.canvasFoto.width,this.canvasFoto.height,100);
		processosAnalises.push(novoProcessoAnalise);
		numProcessosAnalises++;
	}
}
function criarNovaAnalise(argFoto) {
	let novaAnalise=new Analise(argFoto);
	analises.push(novaAnalise);
	numAnalises++;
	divListaAnalises.appendChild(novaAnalise.divAnalise);
	return novaAnalise;
}

//Processamento de análises
var processosAnalises=[];
var numProcessosAnalises=0;
var emProcesso=false;
var outraVariavel=true;
var analiseProcessada=0;
var processoProcessado=0;
var tamanhoMinimo=16;
var tamanhoMaximo=64;
var threadsProcessamento=8;
var thresholdProcessamento=0;
class ProcessoAnalise {
	analiseFoto=null;
	x1=0;
	y1=0;
	x2=0;
	y2=0;
	porcao=0;
	constructor(argAnalise,argX1,argY1,argX2,argY2,argPorcao) {
		this.analiseFoto=argAnalise;
		this.x1=argX1;
		this.y1=argY1;
		this.x2=argX2;
		this.y2=argY2;
		this.porcao=argPorcao;
	}
	quadrantar() {
		let quadrante1 = new ProcessoAnalise(this.analiseFoto,this.x1                      ,this.y1                      ,this.x1+((this.x2-this.x1)/2),this.y1+((this.y2-this.y1)/2),this.porcao/4);
		let quadrante2 = new ProcessoAnalise(this.analiseFoto,this.x1+((this.x2-this.x1)/2),this.y1                      ,this.x2                      ,this.y1+((this.y2-this.y1)/2),this.porcao/4);
		let quadrante3 = new ProcessoAnalise(this.analiseFoto,this.x1                      ,this.y1+((this.y2-this.y1)/2),this.x1+((this.x2-this.x1)/2),this.y2                      ,this.porcao/4);
		let quadrante4 = new ProcessoAnalise(this.analiseFoto,this.x1+((this.x2-this.x1)/2),this.y1+((this.y2-this.y1)/2),this.x2                      ,this.y2                      ,this.porcao/4);
		processosAnalises.push(quadrante1);
		processosAnalises.push(quadrante2);
		processosAnalises.push(quadrante3);
		processosAnalises.push(quadrante4);
		numProcessosAnalises+=4;
		let ctx=this.analiseFoto.canvasLabel.getContext("2d");
		ctx.beginPath();
		ctx.moveTo(this.x1+((this.x2-this.x1)/2)+0.5,this.y1+0.5);
		ctx.lineTo(this.x1+((this.x2-this.x1)/2)+0.5,this.y2-0.5);
		ctx.stroke();
		ctx.moveTo(this.x1+0.5,this.y1+((this.y2-this.y1)/2)+0.5);
		ctx.lineTo(this.x2-0.5,this.y1+((this.y2-this.y1)/2)+0.5);
		//ctx.rect(this.x1+0.5,this.y1+0.5,this.x2-this.x1+0.5,this.y2-this.y1+0.5);
		ctx.stroke();
	}
	pintar(argCorHex="#FF0000") {
		if (!apenasQuadrantar) {
			let ctx=this.analiseFoto.canvasLabel.getContext("2d");
			ctx.beginPath();
			ctx.fillStyle=argCorHex;
			ctx.fillRect(this.x1,this.y1,this.x2-this.x1,this.y2-this.y1);
		}
		this.analiseFoto.atualizarProgresso(this.porcao);
	}
}
function iniciarProcessamentoTodasAnalises() {
	if (numAnalises>0) {
		if (analiseProcessada!=numAnalises) {
			processosAnalises.length=0;
			analiseProcessada=0;
			processoProcessado=0;
			analises[analiseProcessada].gerarProcesso();
			console.log("Iniciando processamento das análises...");
			emProcesso=true;
			for (let i=0; i<threadsProcessamento; i++) {
				processarProximaAnalise(i);
			}
		} else {
			analiseProcessada++;
			analises[analiseProcessada].gerarProcesso();
			console.log("Continuando processamento das análises...");
			emProcesso=true;
			for (let i=0; i<threadsProcessamento; i++) {
				processarProximaAnalise(i);
			}
		}
	}
	//analiseProcessada=0;
	//emProcesso=true;
	//for (let i = 0; i < numAnalises; i++) {
	//	let novoProcessoAnalise = new ProcessoAnalise(analises[i],0,0,analises[i].canvasFoto.width,analises[i].canvasFoto.height,100);
	//	processosAnalises.push(novoProcessoAnalise);
	//	numProcessosAnalises++;
	//}
	//processarProximaAnalise();
	//console.log(processosAnalises);
}
async function processarProximaAnalise(argThread=0) {
	thresholdProcessamento++;
	if (processoProcessado<numProcessosAnalises) {
		let processoAtual=processosAnalises[processoProcessado];
		processoProcessado++;
		let largura=processoAtual.x2-processoAtual.x1;
		let altura=processoAtual.y2-processoAtual.y1;
		//Inicia processamento:
		console.log("Processo ("+largura+" x "+altura+")");
		if ((largura>tamanhoMaximo)
		|| (altura>tamanhoMaximo)) {
			processoAtual.quadrantar();
		} else {
			let canvasProcessado=document.createElement("canvas");
			let ctx=canvasProcessado.getContext("2d");
			canvasProcessado.width=largura;
			canvasProcessado.height=altura;
			ctx.drawImage(processoAtual.analiseFoto.canvasFoto,
				processoAtual.x1,
				processoAtual.y1,
				largura,
				altura,
				0,0,
				largura,
				altura);
			if (argThread==0) {
				divStatus.innerHTML="";
			}
			//divStatus.appendChild(canvasProcessado);
			resultado = await tensorflow_detectarImagem(canvasProcessado,(argThread==0));
			if (resultado.confidences[resultado.label]<1) {
				if ((largura>tamanhoMinimo)
				|| (altura>tamanhoMinimo)) {
					processoAtual.quadrantar();
				} else {
					console.log("Tamanho mínimo atingido, não é possível quadrantar!");
					for (let i=0; i<numLabels; i++) {
						if (labels[i].nomeLabel==resultado.label) {
							processoAtual.pintar(labels[i].corLabel.hex());
							break;
						}
					}
				}
			} else {
				for (let i=0; i<numLabels; i++) {
					if (labels[i].nomeLabel==resultado.label) {
						processoAtual.pintar(labels[i].corLabel.hex());
						break;
					}
				}
			}
		}
	}
	thresholdProcessamento--;
	if (processoProcessado>=numProcessosAnalises) {
		if (analiseProcessada>=numAnalises) {
			emProcesso=false;
			console.log("Fim do processamento!");
		} else {
			console.log("Análise concluída");
			while (thresholdProcessamento>0) {
				console.log("Aguardando threshold ("+thresholdProcessamento+")");
				await new Promise(r => setTimeout(r, 1000)); //Aguardar por 1 segundo
			}
			if (argThread==0) {
				console.log("Threshold zerado. Prosseguindo para o processamento da próxima análise...");
				analiseProcessada++;
				analises[analiseProcessada].gerarProcesso();
			}
		}
	}
	if (emProcesso) {
		setTimeout(()=>{
			processarProximaAnalise(argThread);
		},1);
	}
	/*
	if (analiseProcessada<2) {
		processosAnalises[analiseProcessada].quadrantar();
	}
	analiseProcessada++;
	if (analiseProcessada<numProcessosAnalises) {
		processarProximaAnalise();
	} else {
		emProcesso=false;
	}
	*/
}
function pausarProcessamento() {
	emProcesso=false;
}
function continuarProcessamento() {
	emProcesso=true;
	processarProximaAnalise();
}
//Modal
const divModal=document.getElementById("modal");
function exibirModal(argIdModal) {
	divModal.style.display="flex";
	let modalAbrir=document.getElementById("modal_"+argIdModal);
	modalAbrir.classList.add("exibir");
}
function sumirModal() {
	divModal.style.display="none";
	let inputsModal=divModal.getElementsByTagName("input");
	for (var i=0; i<inputsModal.length; i++) {
		switch (inputsModal[i].type) {
			case "color": inputsModal[i].value="#000000"; break;
			default: inputsModal[i].value=null;
		}
	}
	let previewersModal=divModal.getElementsByClassName("previewer");
	for (var i=0; i<previewersModal.length; i++) {
		previewersModal[i].style.display="none";
	}
	let modaisAbertos=divModal.getElementsByClassName("exibir");
	for (var i=0; i<modaisAbertos.length; i++) {
		modaisAbertos[i].classList.remove("exibir");
	}
}
//Modal Label:
const inputModal_labelNome=document.getElementById("modal_labelNome");
const inputModal_labelCor=document.getElementById("modal_labelCor");
const inputModal_labelImagem=document.getElementById("modal_labelImagem");
const divModal_labelAmostraImagem=document.getElementById("modal_labelAmostraImagem");
const imgModal_labelPreview=document.getElementById("modal_labelPreview");
function aplicarNovoLabel(argNome=inputModal_labelNome.value, argCor=inputModal_labelCor.value, argImagem=inputModal_labelImagem) {
	let nomeLabel=argNome;
	if (nomeLabel=="") {
		nomeLabel="label"+numLabels;
	}
	let corLabel=argCor;
	if (corLabel=="#000000") {
		corLabel=new Cor(gerarNovaCorDefault().hex());
	} else {
		corLabel=new Cor(argCor);
	}
	//Cria o novo label
	let novoLabel=criarNovoLabel(nomeLabel);
	novoLabel.definirCor(corLabel.hex());
	let imagemLabel=null;
	//Adiciona a imagem à label, independente se ela vier de um input (adicionada pela GUI) ou de um img (pré-adicionada na página, pra fins de teste)
	switch (argImagem.tagName) {
		case "INPUT": {
			let arquivoImagem = argImagem.files[0];
			let leitorImagem = new FileReader();
			leitorImagem.onload = function(e) {
				let novaImagem = new Image();
				novaImagem.onload=function() {
					novoLabel.definirImagem(novaImagem);
					if (tensorFlowIniciado) {
						tensorflow_adicionarAmostra(novoLabel);
					}
				}
				novaImagem.src=e.target.result;
			}
			if (arquivoImagem!=null) {
				leitorImagem.readAsDataURL(arquivoImagem);
			}
		} break;
		case "IMG": {
			novoLabel.definirImagem(argImagem);
			if (tensorFlowIniciado) {
				tensorflow_adicionarAmostra(novoLabel);
			}
		} break;
	}
	sumirModal();
}
function atualizarPreviewModalLabel() {
	let arquivoImagem = inputModal_labelImagem.files[0];
	let leitorImagem = new FileReader();
	leitorImagem.onload = function(e) {
		imgModal_labelPreview.src=e.target.result;
	}
	leitorImagem.readAsDataURL(arquivoImagem);
	divModal_labelAmostraImagem.style.display="block";
}
//Modal Analise:
const inputModal_analiseImagem=document.getElementById("modal_analiseImagem");
const divModal_analiseAmostraImagem=document.getElementById("modal_analiseAmostraImagem");
const imgModal_analisePreview=document.getElementById("modal_analisePreview");
function aplicarNovaAnalise(argImagem=inputModal_analiseImagem) {
	let novaAnalise=null;
	switch (argImagem.tagName) {
		case "INPUT": {
			let arquivoImagem = argImagem.files[0];
			let leitorImagem = new FileReader();
			leitorImagem.onload = function(e) {
				let novaImagem = new Image();
				novaImagem.onload=function() {
					novaAnalise=criarNovaAnalise(novaImagem);
				}
				novaImagem.src=e.target.result;
			}
			if (arquivoImagem!=null) {
				leitorImagem.readAsDataURL(arquivoImagem);
			}
		} break;
		case "IMG": {
			novaAnalise=criarNovaAnalise(argImagem);
		} break;
	}
	sumirModal();
}
function atualizarPreviewModalAnalise() {
	let arquivoImagem = inputModal_analiseImagem.files[0];
	let leitorImagem = new FileReader();
	leitorImagem.onload = function(e) {
		imgModal_analisePreview.src=e.target.result;
	}
	leitorImagem.readAsDataURL(arquivoImagem);
	divModal_analiseAmostraImagem.style.display="block";
}

//Status
const divStatus=document.getElementById("status");

//Classificador KNN
var KNN;
var MBNET;
const webcamElement = document.getElementById('webcam');
var tensorFlowIniciado=false;
var maximoClassificacoes=10;
var numAmostrasAleatorias=50;
async function iniciarTensorflow() {
	console.log('Iniciando mobilenet..');
	KNN = knnClassifier.create();
	MBNET = await mobilenet.load();
  	console.log('Modelo carregado');
	tensorFlowIniciado=true;
	//Ao inicia o tensorflow, se tiver quaisquer labels já adicionados, incrementa eles pro knn
	for (let i=0; i<numLabels; i++) {
		await tensorflow_adicionarAmostra(labels[i]);
	}
	/*const webcam = await tf.data.webcam(webcamElement);
	while (true) {
		if (classifier.getNumClasses() > 0) {
			const img = await webcam.capture();
			// Get the activation from mobilenet from the webcam.
			const activation = net.infer(img, 'conv_preds');
			// Get the most likely class and confidence from the classifier module.
			const result = await classifier.predictClass(activation);
			//divStatus.innerText = `prediction: ${classes[result.label]}\nprobability: ${result.confidences[result.label]}`;
			// Dispose the tensor to release the memory.
			img.dispose();
		}
		await tf.nextFrame();
	}*/
}
async function tensorflow_adicionarAmostra(argLabel) {
	//Perara um canvas
	console.log("Carregando amostras do label "+argLabel.nomeLabel+"...");
	let imagemAdaptada = document.createElement("canvas");
	imagemAdaptada.width=224;
	imagemAdaptada.height=224;
	divStatus.appendChild(imagemAdaptada);
	let ctx = imagemAdaptada.getContext("2d");
	ctx.drawImage(argLabel.imagemLabel,0,0,224,224);
	const logits = await MBNET.infer(imagemAdaptada, true);
	await KNN.addExample(logits, argLabel.nomeLabel);
	logits.dispose();
	//Aleatoriza a imagem de amostra, pra gerar material pra teste
	let i=0;
	let carregamento=setInterval(function(){
		if (i<numAmostrasAleatorias) {
			ctx.drawImage(argLabel.imagemLabel,0-Math.random()*i,0-Math.random()*i,224+i+Math.random()*i,224+i+Math.random()*i);
			//Adiciona o exemplo no knn
			const logits = MBNET.infer(imagemAdaptada, true);
			//logits.print(true);
			KNN.addExample(logits, argLabel.nomeLabel);
			//imagemAdaptada.dispose();
			logits.dispose();
			i++;
		} else {
			clearInterval(carregamento);
			console.log("Label "+argLabel.nomeLabel+" carregado");
		}
	},1);
	//divStatus.appendChild(argLabel.imagem);
}
async function tensorflow_detectarImagem(argImagem,argRelatar=true) {
	//Prepara um canvas com a imagem
	const imagemAdaptada = document.createElement("canvas");
	imagemAdaptada.width=224;
	imagemAdaptada.height=224;
	var ctx = imagemAdaptada.getContext("2d");
	//Copia a imagem enviada pro tensorflow detectar, nas dimensões da Mobilenet
	ctx.drawImage(argImagem,0,0,224,224);
	if (argRelatar) {
		divStatus.appendChild(imagemAdaptada);
	}
	//Faz a predição
	const numClasses = KNN.getNumClasses();
	if (numClasses > 0) {
		const logits = MBNET.infer(imagemAdaptada, 'conv_preds');
		const result = await KNN.predictClass(logits, maximoClassificacoes);
		console.log(result.confidences);
		if (argRelatar) {
			var paragrafoStatus=document.createElement("p");
			paragrafoStatus.innerText = `
			prediction: ${result.label}\n
			probability: ${result.confidences[result.label]}
			`;
			divStatus.appendChild(paragrafoStatus);
		}
		//imagemAdaptada.dispose();
		logits.dispose();
		return result;
	} else {
		console.log("Tem nada aqui!");
	}
}

//DEBUG:
document.body.onload=async function(){
	//aplicarNovoLabel("tijolo","#000000",document.getElementById("testeLabel"));
	//aplicarNovoLabel("cimento","#000000",document.getElementById("testeLabel2"));
	//aplicarNovoLabel("grama","#000000",document.getElementById("testeLabel3"));
	//aplicarNovoLabel("gramaSeca","#000000",document.getElementById("testeLabel4"));
	//aplicarNovoLabel("terra","#000000",document.getElementById("testeLabel5"));
	//criarNovaAnalise(document.getElementById("testeAnalise"));
	//criarNovaAnalise(document.getElementById("testeAnalise2"));
	//criarNovaAnalise(document.getElementById("testeAnalise3"));
	//criarNovaAnalise(document.getElementById("testeAnalise4"));
	iniciarTensorflow();
}