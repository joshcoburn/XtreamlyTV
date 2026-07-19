(function () {
  'use strict';

  var nowYear = new Date().getFullYear();

  window.XtreamlyTVMock = window.TVeeMock = {
    profile: {
      user_info: { auth: 1, username: 'demo', status: 'Active', exp_date: '1893456000' },
      server_info: { url: 'demo.local', port: '443', https_port: '443', server_protocol: 'https' }
    },
    liveCategories: [
      { category_id: '1', category_name: 'Featured' },
      { category_id: '2', category_name: 'News' },
      { category_id: '3', category_name: 'Sports' },
      { category_id: '4', category_name: 'Entertainment' },
      { category_id: '5', category_name: 'Kids' },
      { category_id: '6', category_name: 'Movies' }
    ],
    liveStreams: [
      { num: 2, name: 'Metro News', stream_id: 1001, stream_icon: '', category_id: '2', epg_channel_id: 'metro.news', content_type: 'live' },
      { num: 14, name: 'Stadium One', stream_id: 1002, stream_icon: '', category_id: '3', epg_channel_id: 'stadium.one', content_type: 'live' },
      { num: 19, name: 'North Sports', stream_id: 1003, stream_icon: '', category_id: '3', epg_channel_id: 'north.sports', content_type: 'live' },
      { num: 22, name: 'Prime Cinema', stream_id: 1004, stream_icon: '', category_id: '6', epg_channel_id: 'prime.cinema', content_type: 'live' },
      { num: 31, name: 'Discovery World', stream_id: 1005, stream_icon: '', category_id: '4', epg_channel_id: 'discovery.world', content_type: 'live' },
      { num: 36, name: 'Retro TV', stream_id: 1006, stream_icon: '', category_id: '4', epg_channel_id: 'retro.tv', content_type: 'live' },
      { num: 45, name: 'Junior Club', stream_id: 1007, stream_icon: '', category_id: '5', epg_channel_id: 'junior.club', content_type: 'live' },
      { num: 51, name: 'Nature Live', stream_id: 1008, stream_icon: '', category_id: '4', epg_channel_id: 'nature.live', content_type: 'live' },
      { num: 64, name: 'World Report', stream_id: 1009, stream_icon: '', category_id: '2', epg_channel_id: 'world.report', content_type: 'live' },
      { num: 77, name: 'Arena Extra', stream_id: 1010, stream_icon: '', category_id: '3', epg_channel_id: 'arena.extra', content_type: 'live' },
      { num: 81, name: 'Classic Movies', stream_id: 1011, stream_icon: '', category_id: '6', epg_channel_id: 'classic.movies', content_type: 'live' },
      { num: 95, name: 'Science Now', stream_id: 1012, stream_icon: '', category_id: '4', epg_channel_id: 'science.now', content_type: 'live' }
    ],
    vodCategories: [
      { category_id: '101', category_name: 'New Releases' },
      { category_id: '102', category_name: 'Action' },
      { category_id: '103', category_name: 'Comedy' },
      { category_id: '104', category_name: 'Drama' },
      { category_id: '105', category_name: 'Family' }
    ],
    vodStreams: [
      { stream_id: 2001, name: 'Midnight Circuit', category_id: '102', stream_icon: '', container_extension: 'mp4', rating: '8.2', releaseDate: String(nowYear), plot: 'A precision driver is pulled into a citywide race against time.', content_type: 'movie' },
      { stream_id: 2002, name: 'The Last Signal', category_id: '104', stream_icon: '', container_extension: 'mp4', rating: '7.8', releaseDate: String(nowYear - 1), plot: 'A radio engineer uncovers a message that should not exist.', content_type: 'movie' },
      { stream_id: 2003, name: 'Weekend Forecast', category_id: '103', stream_icon: '', container_extension: 'mp4', rating: '7.4', releaseDate: String(nowYear), plot: 'Three friends chase sunshine and find a much stranger adventure.', content_type: 'movie' },
      { stream_id: 2004, name: 'Northbound', category_id: '104', stream_icon: '', container_extension: 'mp4', rating: '8.0', releaseDate: String(nowYear - 2), plot: 'A family road trip becomes a quiet story about starting over.', content_type: 'movie' },
      { stream_id: 2005, name: 'Orbit Kids', category_id: '105', stream_icon: '', container_extension: 'mp4', rating: '7.6', releaseDate: String(nowYear), plot: 'Young explorers turn a school science project into a cosmic rescue.', content_type: 'movie' },
      { stream_id: 2006, name: 'Glass Harbor', category_id: '101', stream_icon: '', container_extension: 'mp4', rating: '8.4', releaseDate: String(nowYear), plot: 'A detective returns home to solve a disappearance on the waterfront.', content_type: 'movie' },
      { stream_id: 2007, name: 'Second Take', category_id: '103', stream_icon: '', container_extension: 'mp4', rating: '7.2', releaseDate: String(nowYear - 1), plot: 'A washed-up actor gets one last chance at a comeback.', content_type: 'movie' },
      { stream_id: 2008, name: 'Redline Atlas', category_id: '102', stream_icon: '', container_extension: 'mp4', rating: '7.9', releaseDate: String(nowYear - 1), plot: 'An expedition races to recover a map hidden beyond the polar circle.', content_type: 'movie' }
    ],
    seriesCategories: [
      { category_id: '201', category_name: 'Featured Series' },
      { category_id: '202', category_name: 'Drama' },
      { category_id: '203', category_name: 'Comedy' },
      { category_id: '204', category_name: 'Documentary' }
    ],
    series: [
      { series_id: 3001, name: 'Signal House', category_id: '201', cover: '', rating: '8.7', releaseDate: String(nowYear), plot: 'Residents of a remote observatory receive transmissions from impossible places.', content_type: 'series' },
      { series_id: 3002, name: 'Common Ground', category_id: '202', cover: '', rating: '8.1', releaseDate: String(nowYear - 1), plot: 'Four families reshape a neighborhood and each other.', content_type: 'series' },
      { series_id: 3003, name: 'Office Hours', category_id: '203', cover: '', rating: '7.9', releaseDate: String(nowYear), plot: 'A tiny consulting firm solves big problems in increasingly odd ways.', content_type: 'series' },
      { series_id: 3004, name: 'Wild Lines', category_id: '204', cover: '', rating: '8.9', releaseDate: String(nowYear - 2), plot: 'A cinematic journey along the invisible borders followed by wildlife.', content_type: 'series' },
      { series_id: 3005, name: 'Afterlight', category_id: '202', cover: '', rating: '8.3', releaseDate: String(nowYear), plot: 'A coastal town rebuilds after a mysterious blackout.', content_type: 'series' },
      { series_id: 3006, name: 'The Small Stuff', category_id: '203', cover: '', rating: '7.7', releaseDate: String(nowYear - 1), plot: 'Everyday inconveniences become absurdly complicated.', content_type: 'series' }
    ],
    epg: function (channel) {
      var now = Math.floor(Date.now() / 1000);
      return [
        { title: channel.name + ' Live', description: 'Live programming on ' + channel.name + '.', start_timestamp: now - 900, stop_timestamp: now + 2700 },
        { title: 'Up Next', description: 'The next scheduled program.', start_timestamp: now + 2700, stop_timestamp: now + 6300 }
      ];
    },
    vodInfo: function (movie) {
      return {
        movie_data: Object.assign({}, movie),
        info: {
          name: movie.name,
          plot: movie.plot,
          rating: movie.rating,
          releasedate: movie.releaseDate,
          duration: '1h 48m',
          genre: 'Drama, Adventure',
          cast: 'Avery Stone, Morgan Lee, Jordan Park',
          director: 'Taylor Quinn'
        }
      };
    },
    seriesInfo: function (series) {
      var makeEpisode = function (season, episode, title) {
        return {
          id: Number(String(series.series_id) + String(season) + String(episode)),
          episode_num: episode,
          title: title,
          container_extension: 'mp4',
          season: season,
          info: { plot: 'Episode ' + episode + ' of ' + series.name + '.', duration: '48m', rating: '8.' + episode }
        };
      };
      return {
        info: Object.assign({}, series),
        seasons: [
          { season_number: 1, name: 'Season 1' },
          { season_number: 2, name: 'Season 2' }
        ],
        episodes: {
          '1': [makeEpisode(1, 1, 'First Light'), makeEpisode(1, 2, 'Crossing Over'), makeEpisode(1, 3, 'The Long Night'), makeEpisode(1, 4, 'Open Channel')],
          '2': [makeEpisode(2, 1, 'Return Signal'), makeEpisode(2, 2, 'Static'), makeEpisode(2, 3, 'A Quiet Frequency'), makeEpisode(2, 4, 'Beyond Range')]
        }
      };
    }
  };

  /* Backwards-compatible aliases used by early builds. */
  window.XtreamlyTVMock.categories = window.TVeeMock.categories = window.XtreamlyTVMock.liveCategories = window.TVeeMock.liveCategories;
  window.XtreamlyTVMock.streams = window.TVeeMock.streams = window.XtreamlyTVMock.liveStreams = window.TVeeMock.liveStreams;
}());
