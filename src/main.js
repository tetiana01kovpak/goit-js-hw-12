import { getImagesByQuery } from './js/pixabay-api';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const form = document.querySelector('.form');
const input = form.elements['search-text'];
const loadMoreBtn = document.querySelector('.load-more');
const gallery = document.querySelector('.gallery');

let currentQuery = '';
let currentPage = 1;
const PER_PAGE = 15;
let totalHits = 0;

form.addEventListener('submit', async e => {
  e.preventDefault();
  const query = input.value.trim();

  if (!query) {
    iziToast.warning({
      title: 'Warning',
      message: 'Please enter a search term!',
      position: 'topRight',
    });
    return;
  }

  if (query !== currentQuery) {
    currentQuery = query;
    currentPage = 1;
    clearGallery();
    hideLoadMoreButton();
  }

  showLoader();

  try {
    const data = await getImagesByQuery(currentQuery, currentPage);
    hideLoader();

    if (!data.hits || data.hits.length === 0) {
      iziToast.info({
        title: 'No results',
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });
      return;
    }

    // On first page show total hits
    if (currentPage === 1) {
      iziToast.success({
        title: 'Found',
        message: `Hooray! We found ${data.totalHits} images.`,
        position: 'topRight',
      });
    }

    createGallery(data.hits);
    totalHits = data.totalHits;

    // Show or hide Load more
    if (currentPage * PER_PAGE < totalHits) {
      showLoadMoreButton();
    } else {
      hideLoadMoreButton();
      // If we've loaded everything and it's not the very first load, notify
      if (currentPage > 1) {
        iziToast.info({
          title: 'End',
          message: "We're sorry, but you've reached the end of search results.",
          position: 'topRight',
        });
      }
    }
  } catch (err) {
    hideLoader();
    iziToast.error({
      title: 'Error',
      message: 'Something went wrong while fetching images.',
      position: 'topRight',
    });
  } finally {
    form.reset();
  }
});

// Load more handler
if (loadMoreBtn) {
  loadMoreBtn.addEventListener('click', async () => {
    // guard
    if (!currentQuery) return;

    currentPage += 1;
    showLoader();
    try {
      const data = await getImagesByQuery(currentQuery, currentPage);
      hideLoader();

      if (!data.hits || data.hits.length === 0) {
        hideLoadMoreButton();
        iziToast.info({
          title: 'End',
          message: "We're sorry, but you've reached the end of search results.",
          position: 'topRight',
        });
        return;
      }

      createGallery(data.hits);

      // After adding new elements, scroll by two card heights
      const firstCard = gallery.querySelector('.gallery-item');
      if (firstCard) {
        const { height } = firstCard.getBoundingClientRect();
        window.scrollBy({ top: height * 2, behavior: 'smooth' });
      }

      // Check end of collection
      if (currentPage * PER_PAGE >= data.totalHits) {
        hideLoadMoreButton();
        iziToast.info({
          title: 'End',
          message: "We're sorry, but you've reached the end of search results.",
          position: 'topRight',
        });
      } else {
        showLoadMoreButton();
      }
    } catch (err) {
      hideLoader();
      iziToast.error({
        title: 'Error',
        message: 'Something went wrong while loading more images.',
        position: 'topRight',
      });
    }
  });
}
