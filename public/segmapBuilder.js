//Constantes
const input_autoFocoProcessamento = document.getElementById("autoFocoProcessamento");

//Opções gerais
var apenasQuadrantar=false;
var preload=true;
var maximoClassificacoes=10;
var numAmostrasAleatorias=50;
var emProcesso=false;
var tamanhoMinimo=64;
var tamanhoMaximo=64;
var varRotacao=true;
var varEscala=true;
var varDeslocamento=true;
var threadsProcessamento=8;
var coeficienteProbabilidade=0.9;

//Funções gerais
function mudarTextoElemento(argElemento,argTexto) {
	argElemento.innerHTML=argTexto;
}

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
	idLabel = 0;
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
	novoLabel.idLabel = numLabels;
	numLabels++;
	divListaLabels.appendChild(novoLabel.fieldset);
	return novoLabel;
}
function obterLabelCor(argCorHex) {
	let labelEscolhido = null;
	for (var i=0; i<numLabels; i++) {
		if (labels[i].corLabel.hex()==argCorHex) {
			labelEscolhido=labels[i];
			break;
		}
	};
	return labelEscolhido;
}
class LabelLista {
	nomeLabel = "";
	corLabel = new Cor();
	constructor (argCor, argNome) {
		let cores=argCor.split(" ");
		this.corLabel.r = parseInt(cores[0]);
		this.corLabel.g = parseInt(cores[1]);
		this.corLabel.b = parseInt(cores[2]);
		this.nomeLabel = argNome;
	}
}
var listaLabelsCriar=[];
function enviarListaLabels() {
	let inputListaLabels = document.createElement("input");
	inputListaLabels.type = "file";
	inputListaLabels.accept = ".txt";
	inputListaLabels.click();
	inputListaLabels.onchange=()=>{
		//console.log("MA OEEEEE");
		let readerLista = new FileReader();
		readerLista.onload = ()=>{
			let linhas = readerLista.result.split(/\r?\n|\r|\n/g);
			linhas.forEach(linha => {
				let linhaConteudo = linha.split(/\t/g);
				let novoLabelLista = new LabelLista(linhaConteudo[0],linhaConteudo[1]);
				listaLabelsCriar.push(novoLabelLista);
			});
			abrirListaLabel();
		}
		readerLista.readAsText(inputListaLabels.files[0]);
	}
}
function abrirListaLabel() {
	if (listaLabelsCriar.length>0) {
		exibirModal('label');
		inputModal_labelNome.value = listaLabelsCriar[0].nomeLabel;
		inputModal_labelCor.value = listaLabelsCriar[0].corLabel.hex();
		listaLabelsCriar.shift();
	}
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
	momentoInicio=0;
	momentoFim=0;
	duracao=0;
	divStatus=null;
	emExecucao=false;
	numQuadrantes=0;
	exibirOneChannel=false;
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
		this.oneChannel=document.createElement("div");
		this.oneChannel.classList.add("analise_oneChannel");
		this.oneChannel.style.display="none";
		this.oneChannelIndices=[];
		this.progresso=document.createElement("progress");
		this.progresso.max=100;
		this.progresso.value=0;
		this.divStatus=document.createElement("div");
		this.atualizarStatus();
		this.identificador=document.createElement("div");
		this.identificador.classList.add("analise_id");
		this.identificador.innerHTML="#"+numAnalises.toString();
		this.divBotoes=document.createElement("div");
		this.divBotoes.classList.add("analise_botoes");
		this.buttonFechar = document.createElement("button");
		this.buttonFechar.innerHTML = "X";
		this.buttonFechar.title = "Fechar esta análise";
		this.divBotoes.appendChild(this.buttonFechar);
		this.buttonOneChannel = document.createElement("button");
		this.buttonOneChannel.innerHTML = "1c";
		this.buttonOneChannel.title = "Alternar exibição de listagem em um canal";
		this.buttonOneChannel.disabled = true;
		this.buttonOneChannel.onclick = ()=>{
			this.computarOneChannel();
		};
		this.divBotoes.appendChild(this.buttonOneChannel);
		this.divAnalise.appendChild(this.canvasFoto);
		this.divAnalise.appendChild(this.canvasLabel);
		this.divAnalise.appendChild(this.oneChannel);
		this.divAnalise.appendChild(this.progresso);
		this.divAnalise.appendChild(this.divStatus);
		this.divAnalise.appendChild(this.identificador);
		this.divAnalise.appendChild(this.divBotoes);
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
	computarOneChannel() {
		if (!this.exibirOneChannel) {
			console.log("COMPUTANDO...");
			this.oneChannel.innerHTML="";
			let ctx = this.canvasLabel.getContext("2d", {alpha: false, antialias: false, willReadFrequently: true});
			let imgData = ctx.getImageData(0,0,this.imagemAnalise.naturalWidth,this.imagemAnalise.naturalHeight);
			let ctxData = imgData.data;
			for (let indiceY=0; indiceY < this.imagemAnalise.naturalHeight; indiceY+=tamanhoMinimo) {
				let indiceLinha = indiceY * this.imagemAnalise.naturalWidth;
				//console.log("LINHA "+indiceY.toString() + " (" + indiceLinha.toString() + ")");
				for (let indiceX=0; indiceX < this.imagemAnalise.naturalWidth; indiceX+=tamanhoMinimo) {
					let indice = (indiceLinha + indiceX) * 4;
					//console.log(ctxData[indice].toString() + "," + ctxData[indice+1].toString() + "," + ctxData[indice+2].toString());
					this.oneChannel.innerHTML+=obterLabelCor("#"+ctxData[indice].toString(16).padStart(2,"0")+ctxData[indice+1].toString(16).padStart(2,"0")+ctxData[indice+2].toString(16).padStart(2,"0")).idLabel+",";
				}
				this.oneChannel.innerHTML+="<br>";
			}
			//console.log(ctxData);
			this.exibirOneChannel=true;
			this.oneChannel.style.display=null;
			this.canvasFoto.style.display="none";
			this.canvasLabel.style.display="none";
		} else {
			this.exibirOneChannel=false;
			this.oneChannel.style.display="none";
			this.canvasFoto.style.display=null;
			this.canvasLabel.style.display=null;
		}
	}
	atualizarProgresso(argQtd) {
		this.valorProgresso+=argQtd;
		this.progresso.value=this.valorProgresso;
		this.atualizarStatus();
	}
	atualizarStatus() {
		let texto="Estado: ";
		if (this.emExecucao) {
			texto+=" Em execução";
		} else {
			texto+=" Parado";
		}
		if ((this.emExecucao) || (this.momentoFim!=0)) {
			texto+=" | Tempo total: "+this.obterDuracao() + " s";
		}
		if (this.numQuadrantes>0) {
			texto+=" | Num. quadrantes: "+this.numQuadrantes;
		}
		this.divStatus.innerHTML=texto;
	}
	gerarProcesso() {
		let novoProcessoAnalise = new ProcessoAnalise(this,0,0,this.canvasFoto.width,this.canvasFoto.height,100);
		processosAnalises.push(novoProcessoAnalise);
		numProcessosAnalises++;
		this.momentoInicio=Date.now();
		this.momentoFim=0;
		this.emExecucao=true;
		this.atualizarStatus();
		this.buttonOneChannel.disabled = true;
		if (input_autoFocoProcessamento.checked) {
			this.divAnalise.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
		}
	}
	finalizarProcesso() {
		this.momentoFim=Date.now();
		this.emExecucao=false;
		this.atualizarStatus();
		this.buttonOneChannel.disabled = false;
	}
	obterDuracao() {
		if (this.momentoFim==0) {
			this.duracao=Date.now()-this.momentoInicio;
		} else {
			this.duracao=this.momentoFim-this.momentoInicio;
		}
		let segundos = this.duracao/1000;
		return segundos.toFixed(1);
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
var outraVariavel=true;
var analiseProcessada=0;
var processoProcessado=0;
var thresholdProcessamento=0;
var processosProntos=0;
var processosContinuar=0;
class ProcessoAnalise {
	analiseFoto=null;
	x1=0;
	y1=0;
	x2=0;
	y2=0;
	porcao=0;
	constructor(argAnalise,argX1,argY1,argX2,argY2,argPorcao) {
		this.analiseFoto=argAnalise;
		this.analiseFoto.numQuadrantes++;
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
var timerStatusUpdate=null;
function iniciarProcessamentoTodasAnalises() {
	if (numAnalises>0) {
		if (analiseProcessada!=numAnalises) {
			processosAnalises.length=0;
			analiseProcessada=0;
			processoProcessado=0;
			console.log("Iniciando processamento das análises...");
		} else {
			analiseProcessada++;
			console.log("Continuando processamento das análises...");
		}
		analises[analiseProcessada].gerarProcesso();
		emProcesso=true;
		for (let i=0; i<threadsProcessamento; i++) {
			processarProximaAnalise(i);
		}
		timerStatusUpdate=setInterval(atualizarStatusGeral,100);
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
		//console.log("Processo ("+largura+" x "+altura+")");
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
			//divStatus.appendChild(canvasProcessado);
			resultado = await tensorflow_detectarImagem(canvasProcessado,(argThread==0));
			if (resultado.confidences[resultado.label]<coeficienteProbabilidade) {
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
		console.log("Análise concluída");
		processosProntos++;
		if (processosProntos<threadsProcessamento) {
			console.log("Aguardando threads ("+(threadsProcessamento-processosProntos)+")");
			while (processosProntos<threadsProcessamento) {
				if (processosContinuar>0) {
					processosContinuar--;
					break;
				} else {
					await new Promise(r => setTimeout(r, 1000)); //Aguardar por 1 segundo
				}
			}
		}
		//console.log("Prosseguindo...");
		if (argThread==0) {
			processosProntos=0;
			processosContinuar=threadsProcessamento-1;
			analises[analiseProcessada].finalizarProcesso();
			analiseProcessada++;
			if (analiseProcessada>=numAnalises) {
				emProcesso=false;
				console.log("Fim do processamento!");
			} else {
				console.log("Prosseguindo para a análise "+analiseProcessada+"...");
				analises[analiseProcessada].gerarProcesso();
			}
		}
	}
	if (emProcesso) {
		setTimeout(()=>{
			processarProximaAnalise(argThread);
		},1);
	} else {
		console.log("Thread "+argThread+" encerrada.");
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
	switch (argIdModal) {
		case "configuracoes": obterConfiguracoes(); break;
		default: {}
	}
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
//const imgModal_labelPreview=document.getElementById("modal_labelPreview");
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
	let imagemLabel=null;
	//Adiciona a imagem à label, independente se ela vier de um input (adicionada pela GUI) ou de um img (pré-adicionada na página, pra fins de teste)
	switch (argImagem.tagName) {
		case "INPUT": {
			numImagens=argImagem.files.length;
			for (let i=0; i<numImagens; i++) {
				//Cria o novo label
				let novoLabel=criarNovoLabel(nomeLabel);
				novoLabel.definirCor(corLabel.hex());
				//Cria o leitor
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
				let arquivoImagem = argImagem.files[i];
				if (arquivoImagem!=null) {
					console.log(argImagem.files[i]);
					leitorImagem.readAsDataURL(arquivoImagem);
				}
			}
		} break;
		case "IMG": {
			//Cria o novo label
			let novoLabel=criarNovoLabel(nomeLabel);
			novoLabel.definirCor(corLabel.hex());
			novoLabel.definirImagem(argImagem);
			if (tensorFlowIniciado) {
				tensorflow_adicionarAmostra(novoLabel);
			}
		} break;
	}
	sumirModal();
	abrirListaLabel();
}
function atualizarPreviewModalLabel() {
	divModal_labelAmostraImagem.innerHTML="";
	divModal_labelAmostraImagem.style.display="none";
	divModal_labelAmostraImagem.appendChild(document.createElement("hr"));
	let numArquivos = inputModal_labelImagem.files.length;
	for (let i = 0; i < numArquivos; i++) {
		let novoImg = document.createElement("img");
		novoImg.classList.add("imagemLabel");
		let arquivoImagem = inputModal_labelImagem.files[i];
		let leitorImagem = new FileReader();
		leitorImagem.onload = function(e) {
			novoImg.src=e.target.result;
		}
		leitorImagem.readAsDataURL(arquivoImagem);
		divModal_labelAmostraImagem.appendChild(novoImg);
	}
	divModal_labelAmostraImagem.appendChild(document.createElement("hr"));
	divModal_labelAmostraImagem.style.display="block";
}
//Modal Analise:
const inputModal_analiseImagem=document.getElementById("modal_analiseImagem");
const divModal_analiseAmostraImagem=document.getElementById("modal_analiseAmostraImagem");
//const imgModal_analisePreview=document.getElementById("modal_analisePreview");
function aplicarNovaAnalise(argImagem=inputModal_analiseImagem) {
	let novaAnalise=null;
	switch (argImagem.tagName) {
		case "INPUT": {
			let numAnalises = argImagem.files.length;
			for (let i = 0; i < numAnalises; i++) {
				let arquivoImagem = argImagem.files[i];
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
			}
		} break;
		case "IMG": {
			novaAnalise=criarNovaAnalise(argImagem);
		} break;
	}
	sumirModal();
}
function atualizarPreviewModalAnalise() {
	divModal_analiseAmostraImagem.innerHTML="";
	divModal_analiseAmostraImagem.style.display="none";
	divModal_analiseAmostraImagem.appendChild(document.createElement("hr"));
	let numArquivos = inputModal_analiseImagem.files.length;
	for (let i = 0; i < numArquivos; i++) {
		let novoImg = document.createElement("img");
		novoImg.classList.add("imagemAnalise");
		let arquivoImagem = inputModal_analiseImagem.files[i];
		let leitorImagem = new FileReader();
		leitorImagem.onload = function(e) {
			novoImg.src=e.target.result;
		}
		leitorImagem.readAsDataURL(arquivoImagem);
		divModal_analiseAmostraImagem.appendChild(novoImg);
	}
	divModal_analiseAmostraImagem.appendChild(document.createElement("hr"));
	divModal_analiseAmostraImagem.style.display="block";
}
//Modal Configurações:
const inputModal_configuracoesNumAmostras=document.getElementById("modal_configuracoesNumAmostras");
const inputModal_configuracoesVarRotacao=document.getElementById("modal_configuracoesVarRotacao");
const inputModal_configuracoesVarEscala=document.getElementById("modal_configuracoesVarEscala");
const inputModal_configuracoesVarDeslocamento=document.getElementById("modal_configuracoesVarDeslocamento");
const inputModal_configuracoesNumThreads=document.getElementById("modal_configuracoesNumThreads");
const selectModal_configuracoesTamMin=document.getElementById("modal_configuracoesTamMin");
const selectModal_configuracoesTamMax=document.getElementById("modal_configuracoesTamMax");
const inputModal_configuracoesProbabilidade=document.getElementById("modal_configuracoesProbabilidade");
function obterConfiguracoes() {
	inputModal_configuracoesNumAmostras.value=numAmostrasAleatorias;
	inputModal_configuracoesVarRotacao.checked=varRotacao;
	inputModal_configuracoesVarEscala.checked=varEscala;
	inputModal_configuracoesVarDeslocamento.checked=varDeslocamento;
	inputModal_configuracoesNumThreads.value=threadsProcessamento;
	selectModal_configuracoesTamMin.value=tamanhoMinimo;
	selectModal_configuracoesTamMax.value=tamanhoMaximo;
	inputModal_configuracoesProbabilidade.value=coeficienteProbabilidade*100;
}
function aplicarConfiguracoes() {
	numAmostrasAleatorias=parseInt(inputModal_configuracoesNumAmostras.value);
	varRotacao=inputModal_configuracoesVarRotacao.checked;
	varEscala=inputModal_configuracoesVarEscala.checked;
	varDeslocamento=inputModal_configuracoesVarDeslocamento.checked;
	threadsProcessamento=parseInt(inputModal_configuracoesNumThreads.value);
	console.log({selectModal_configuracoesTamMin});
	console.log({selectModal_configuracoesTamMax});
	tamanhoMinimo=parseInt(selectModal_configuracoesTamMin.value);
	tamanhoMaximo=parseInt(selectModal_configuracoesTamMax.value);
	coeficienteProbabilidade=parseInt(inputModal_configuracoesProbabilidade.value)/100;
	console.log("Configurações aplicadas!");
	console.log(numAmostrasAleatorias);
	console.log(threadsProcessamento);
	console.log(tamanhoMinimo);
	console.log(tamanhoMaximo);
	console.log(coeficienteProbabilidade);
	sumirModal();
}
obterConfiguracoes();

//Status
const divStatus=document.getElementById("status");
const divStatusGeral=document.getElementById("statusGeral");
const divStatusLeituras=document.getElementById("statusLeituras");
function atualizarStatusGeral(argStatus="") {
	let textoStatus="";
	if (argStatus=="") {
		if (preload) {
			textoStatus="Carregando...";
		} else {
			if (!tensorFlowIniciado) {
				textoStatus="Mobilenet não carregado";
			} else {
				if (amostrasCarregadasTensorflow<numLabels) {
					textoStatus="Carregando amostras...";
				} else {
					if (emProcesso) {
						textoStatus="Em execução ("+thresholdProcessamento+"):";
					} else {
						textoStatus="Pronto!";
					}
				}
			}
		}
	} else {
		textoStatus=argStatus;
	}
	divStatusGeral.innerHTML=textoStatus;
}

//Classificador KNN
var KNN;
var MBNET;
const webcamElement = document.getElementById('webcam');
var tensorFlowIniciado=false;
var amostrasCarregadasTensorflow=0;
async function iniciarTensorflow() {
	atualizarStatusGeral("Carregando mobilenet...");
	console.log('Iniciando mobilenet..');
	KNN = knnClassifier.create();
	MBNET = await mobilenet.load();
  	console.log('Modelo carregado');
	tensorFlowIniciado=true;
	atualizarStatusGeral();
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
	atualizarStatusGeral();
	//Perara um canvas
	console.log("Carregando amostras do label "+argLabel.nomeLabel+"...");
	let imagemAdaptada = document.createElement("canvas");
	imagemAdaptada.width=224;
	imagemAdaptada.height=224;
	divStatusLeituras.appendChild(imagemAdaptada);
	let ctx = imagemAdaptada.getContext("2d");
	//Adiciona a imagem original
	ctx.drawImage(argLabel.imagemLabel,0,0,imagemAdaptada.width,imagemAdaptada.height);
	const logits = await MBNET.infer(imagemAdaptada, true);
	await KNN.addExample(logits, argLabel.nomeLabel);
	logits.dispose();
	let i=-8;
	let carregamento=setInterval(function(){
		if (i<0) {
			//Atribui variações
			ctx.clearRect(0, 0, imagemAdaptada.width, imagemAdaptada.height);
			let angulo=0;
			if (varRotacao) {
				angulo=-i * 45;
			}
			let escala=1;
			ctx.save();
			ctx.translate(imagemAdaptada.width / 2, imagemAdaptada.height / 2);
			ctx.rotate(angulo * Math.PI / 180);
			//ctx.drawImage(image, -image.width / 2, -image.height / 2);
			if (angulo%90 == 45) {
				escala=1.5;
			}
			ctx.drawImage(argLabel.imagemLabel,-(imagemAdaptada.width / 2)*escala,-(imagemAdaptada.height / 2)*escala,imagemAdaptada.width*escala,imagemAdaptada.height*escala);
			ctx.restore();
			const logits = MBNET.infer(imagemAdaptada, true);
			KNN.addExample(logits, argLabel.nomeLabel);
			logits.dispose();
			i++;
		} else {
			//Atribui variações aleatórias
			if (i<numAmostrasAleatorias) {
				ctx.clearRect(0, 0, imagemAdaptada.width, imagemAdaptada.height);
				let angulo=0;
				if (varRotacao) {
					angulo=(Math.floor(Math.random() * 8)) * 45;
				}
				let escala=1;
				if (varEscala) {
					escala=1+(i/100);
				}
				if (angulo%90 == 45) {
					escala+=0.5;
				}
				ctx.save();
				ctx.translate(imagemAdaptada.width / 2, imagemAdaptada.height / 2);
				ctx.rotate(angulo * Math.PI / 180);
				let deslocamentoX = -(imagemAdaptada.width / 2)*escala;
				let deslocamentoY = -(imagemAdaptada.height / 2)*escala;
				if (varDeslocamento) {
					deslocamentoX = -(imagemAdaptada.width / 2)*escala + (-i+(Math.random() * (i * 2)));
					deslocamentoY = -(imagemAdaptada.height / 2)*escala + (-i+(Math.random() * (i * 2)));
				}
				ctx.drawImage(argLabel.imagemLabel,deslocamentoX,deslocamentoY,imagemAdaptada.width*escala,imagemAdaptada.height*escala);
				ctx.restore();
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
				amostrasCarregadasTensorflow++;
				atualizarStatusGeral();
			}
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
	//Faz a predição
	const numClasses = KNN.getNumClasses();
	if (numClasses > 0) {
		const logits = MBNET.infer(imagemAdaptada, 'conv_preds');
		const result = await KNN.predictClass(logits, maximoClassificacoes);
		//console.log(result.confidences);
		if (argRelatar) {
			divStatusLeituras.innerHTML="";
			var paragrafoStatus=document.createElement("p");
			paragrafoStatus.innerHTML = "Predição: "+result.label+"<br>Probabilidade: "+result.confidences[result.label];
			divStatusLeituras.appendChild(imagemAdaptada);
			divStatusLeituras.appendChild(paragrafoStatus);
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
	preload=false;
	atualizarStatusGeral();
	//carregarAmostrasExemplo();
	iniciarTensorflow();
	//criarNovaAnalise(document.getElementById("testeAnalise"));
}
function carregarAmostrasExemplo() {
	aplicarNovoLabel("tijolo","#7F0000",document.getElementById("testeLabel"));
	aplicarNovoLabel("cimento","#7F7F7F",document.getElementById("testeLabel2"));
	aplicarNovoLabel("grama","#007F00",document.getElementById("testeLabel3"));
	aplicarNovoLabel("gramaSeca","#7F7F00",document.getElementById("testeLabel4"));
	aplicarNovoLabel("terra","#7F4000",document.getElementById("testeLabel5"));
	criarNovaAnalise(document.getElementById("testeAnalise"));
	criarNovaAnalise(document.getElementById("testeAnalise2"));
	criarNovaAnalise(document.getElementById("testeAnalise3"));
	criarNovaAnalise(document.getElementById("testeAnalise4"));
	criarNovaAnalise(document.getElementById("testeAnalise5"));
}