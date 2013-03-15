/**
   * Index callback
   */

  exports.index = function(req, res) {
    res.render('index', {
      title: 'Home',
      message: req.flash('error')
    });
  };