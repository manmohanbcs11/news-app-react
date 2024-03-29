import { Component } from 'react';
import { NewsApiController, NewsDto } from '../controller/newsApiController';
import { Utils } from '../controller/utils';
import NewsItem from './NewsItem';
import Spinner from './Spinner';
import defaultIcon from './default_icon.png';

interface NewsProps {
  pageSize: number;
  country: string;
  category: string;
  searchItem?: string;
}

interface NewsState {
  articles: NewsDto[];
  loading: boolean;
  pageNumber: number;
  totalArticles: number;
  headlines: string;
}

export default class News extends Component<NewsProps, NewsState> {
  constructor(props: NewsProps) {
    super(props);
    this.state = {
      articles: [],
      loading: false,
      pageNumber: 1,
      totalArticles: 0,
      headlines: ''
    };
  }

  async componentDidMount() {
    const { pageSize, country, category, searchItem } = this.props;
    console.log('componentDidMount searchItem: ', searchItem);

    await this.fetchNews(pageSize, country, category, this.state.pageNumber, searchItem);
  }

  async componentDidUpdate(prevProps: NewsProps, prevState: NewsState) {
    const { pageSize, country, category, searchItem } = this.props;
    console.log('componentDidUpdate searchItem: ', searchItem);

    if (prevState.pageNumber !== this.state.pageNumber) {
      await this.fetchNews(pageSize, country, category, this.state.pageNumber, searchItem);
    }
    if (prevProps.category !== category || prevProps.country !== country || prevProps.searchItem !== searchItem) {
      this.setState({ pageNumber: 1 });
      await this.fetchNews(pageSize, country, category, 1, searchItem);
    }
  }

  capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  async fetchNews(pageSize: number, country: string, category: string, pageNumber: number, searchItem?: string) {
    this.setState({ loading: true });
    const newsApi = new NewsApiController();
    let response;

    if (searchItem && !Utils.isEmpty(searchItem)) {
      document.title = `${this.capitalizeFirstLetter(searchItem)} - NewsBee`;
      this.setState({ headlines: `NewsBee - Top ${this.capitalizeFirstLetter(searchItem)} Headlines` });
      response = await newsApi.fetchNewsByCategory(searchItem, pageNumber, pageSize);
    } else if (!Utils.isEmpty(country)) {
      document.title = `${country.toUpperCase()} - NewsBee`;
      this.setState({ headlines: `NewsBee - Top Headlines in ${country.toUpperCase()}` });
      response = await newsApi.fetchNewsByCountry(country, pageNumber, pageSize);
    } else {
      document.title = `${this.capitalizeFirstLetter(category)} - NewsBee`;
      this.setState({ headlines: `NewsBee - Top ${this.capitalizeFirstLetter(category)} Headlines` });
      response = await newsApi.fetchNewsByCategory(category, pageNumber, pageSize);
    }

    this.setState({
      articles: response[0],
      loading: false,
      totalArticles: response[1],
    });
  }

  handlePreviousClick = () => {
    this.setState((prevState) => ({
      pageNumber: prevState.pageNumber - 1,
    }));
  };

  handleNextClick = () => {
    this.setState((prevState) => ({
      pageNumber: prevState.pageNumber + 1,
    }));
  };

  render() {
    const { articles, loading, pageNumber, totalArticles, headlines } = this.state;

    return (
      <div className='container my-3'>
        <h2 className='text-center'>{headlines}</h2>
        {loading && <Spinner />}
        <div className='row'>
          {!loading && articles.map(article => (
            <div className='col-md-4' key={article.url}>
              <NewsItem
                title={article.title}
                description={article.description}
                imageUrl={Utils.isEmpty(article.urlToImage) ? defaultIcon : article.urlToImage}
                newsUrl={article.url}
                publishedAt={article.publishedAt}
              />
            </div>
          ))}
        </div>
        <div className='container d-flex justify-content-between'>
          <button type="button" disabled={pageNumber <= 1} className="btn btn-dark" onClick={this.handlePreviousClick}>&larr; Previous</button>
          <span>{`Page ${pageNumber}`}</span>
          <button type="button" disabled={totalArticles <= 0} className="btn btn-dark" onClick={this.handleNextClick}>Next &rarr;</button>
        </div>
      </div>
    );
  }
}
