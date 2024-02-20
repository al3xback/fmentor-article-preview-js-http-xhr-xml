import { sendHttpRequest } from './util.js';

const URL =
	'https://gist.githubusercontent.com/al3xback/e6abbb4009d04987cc89ff4028cdb074/raw/2905667f13184666e3b72d25930710d38206edb9/article-preview-data.xml';

const cardWrapperEl = document.querySelector('.card-wrapper');
const cardTemplate = document.getElementById('card-template');
const cardShareButtonTemplate = document.getElementById(
	'card-share-button-template'
);
const loadingEl = document.querySelector('.loading');

const removeLoading = () => {
	loadingEl.parentElement.removeChild(loadingEl);
};

const handleError = (msg) => {
	removeLoading();

	const errorEl = document.createElement('p');
	errorEl.className = 'error';
	errorEl.textContent = msg;

	cardWrapperEl.appendChild(errorEl);
};

const renderCardContent = (data) => {
	const parser = new DOMParser();
	const dataDoc = parser.parseFromString(data, 'text/xml');

	const getElementValue = (name) => {
		const element = dataDoc.getElementsByTagName(name)[0];
		const hasChildren = !!element.children.length;
		if (hasChildren) {
			return [...element.children].map(
				(item) => item.childNodes[0].nodeValue
			);
		}
		return element.childNodes[0].nodeValue;
	};

	const title = getElementValue('title');
	const description = getElementValue('description');
	const image = getElementValue('image');
	const author = getElementValue('author');
	const socialLinks = getElementValue('social_links').map((link) => {
		const linkInfo = link.split(': ');
		return {
			name: linkInfo[0],
			url: linkInfo[1],
		};
	});

	const cardTemplateNode = document.importNode(cardTemplate.content, true);
	const cardEl = cardTemplateNode.querySelector('.card');

	const cardTitleEl = cardEl.querySelector('.card__title');
	cardTitleEl.textContent = title;

	const cardDescEl = cardEl.querySelector('.card__desc');
	cardDescEl.textContent = description;

	const cardImageEl = cardEl.querySelector('.card__image img');
	cardImageEl.src = './images/' + image;
	cardImageEl.alt = image.substring(0, image.indexOf('.'));

	const cardAuthorImageEl = cardEl.querySelector('.card__author-img');
	cardAuthorImageEl.src = './images/' + author[1];
	cardAuthorImageEl.alt = author[0];

	const cardAuthorNameEl = cardEl.querySelector('.card__author-name');
	cardAuthorNameEl.textContent = author[0];

	const cardAuthorPostDateEl = cardEl.querySelector(
		'.card__author-post-date'
	);
	cardAuthorPostDateEl.textContent = author[2];

	const cardShareButtonsEl = cardEl.querySelector(
		'.card__share-action-buttons'
	);

	for (const socialLink of socialLinks) {
		const { name, url } = socialLink;

		const cardShareButtonTemplateNode = document.importNode(
			cardShareButtonTemplate.content,
			true
		);
		const cardShareButtonEl =
			cardShareButtonTemplateNode.querySelector('a');
		cardShareButtonEl.href = url;
		cardShareButtonEl.title = 'Share on ' + name.toLowerCase();

		const cardShareButtonIconEl = cardShareButtonEl.querySelector('i');
		cardShareButtonIconEl.className = 'icon-' + name.toLowerCase();

		cardShareButtonsEl.appendChild(cardShareButtonTemplateNode);
	}

	removeLoading();
	cardWrapperEl.appendChild(cardTemplateNode);
};

sendHttpRequest('GET', URL, renderCardContent, handleError);
