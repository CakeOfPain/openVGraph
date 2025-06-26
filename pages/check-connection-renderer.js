// check-connection-render.js
(function() {
  const steps = [
    'Initialising',
    'Discovering Endpoints',
    'Checking Credentials',
    'Connect and Verifiy',
    'Ready'
  ];

  const total = steps.length;

  function updateProgress(idx, ok = true) {
    // mark completed or failed step
    const el = document.getElementById(`step-${idx}`);
    const badge = el.querySelector('.badge');

    // apply status classes
    el.classList.remove('step-current', 'step-success', 'step-failed');
    badge.className = 'badge';
    if (ok) {
      el.classList.add('step-success');
      badge.classList.add('bg-success');
      badge.textContent = 'Done';
    } else {
      el.classList.add('step-failed');
      badge.classList.add('bg-danger');
      badge.textContent = 'Failed';
    }

    // progress bar
    const progressBar = document.getElementById('progressBar');
    const percent = Math.round(((idx + 1) / total) * 100);
    progressBar.style.width = percent + '%';
    progressBar.setAttribute('aria-valuenow', percent);
    progressBar.textContent = percent + '%';

    // spinner off if done
    if (idx + 1 === total) {
      progressBar.classList.remove('progress-bar-striped', 'progress-bar-animated');
      document.getElementById('spinner').classList.add('d-none');
    }
  }

  function showResult(success, message, failStep) {
    // hide loader
    document.getElementById('loader-wrapper').style.display = 'none';
    document.getElementById('result-view').style.display = 'block';

    // title and message
    document.getElementById('result-title').textContent = success ? 'Connected!' : 'Connection Failed';
    const msgEl = document.getElementById('result-message');
    if (success) {
      msgEl.textContent = message;
    } else {
      msgEl.innerHTML = `<strong>${message}</strong><br><em>Failed at: ${steps[failStep]}</em>`;
    }

    // retry button
    document.getElementById('retry-button').style.display = success ? 'none' : 'inline-block';

    // build final map
    const finalMap = document.getElementById('final-routeMap');
    finalMap.innerHTML = '';
    steps.forEach((label, i) => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      const span = document.createElement('span');
      span.className = 'badge';
      let status;
      if (success) {
        // all done on success
        status = 'Done';
        li.classList.add('step-success');
        span.classList.add('bg-success');
      } else {
        if (i < failStep) {
          status = 'Done';
          li.classList.add('step-success');
          span.classList.add('bg-success');
        } else if (i === failStep) {
          status = 'Failed';
          li.classList.add('step-failed');
          span.classList.add('bg-danger');
        } else {
          status = 'Pending';
          span.classList.add('bg-secondary');
        }
      }
      span.textContent = status;
      li.textContent = label;
      li.appendChild(span);
      finalMap.appendChild(li);
    });
  }

  async function checkConnection() {
    let current = 0;
    // initial spinner step not in final map
    updateProgress(current);

    try {
      // discover endpoints
      current = 1; updateProgress(current);
      const cfg = JSON.parse(localStorage.getItem('connection_config') || '{}');
      const { host, port, useSSL, path, username, password } = cfg;
      const endpoint = `${useSSL ? 'wss' : 'ws'}://${host}:${port}${path}`;

      // check credentials
      current = 2; updateProgress(current);
      const opts = {};
      if (username && password) {
        opts.authenticator = window.gremlinApi.createAuthenticator(username, password);
      }

      // verify schema
      current = 3; updateProgress(current);
      const ok = await window.gremlinApi.checkSchema(endpoint, opts);
      if (!ok) throw new Error('Schema validation failed');

      // ready
      current = 4; updateProgress(current);
      showResult(true, 'You are now connected to JanusGraph.');
    } catch (err) {
      console.error('Connection error:', err);
      updateProgress(current, false);
      showResult(false, err.message || 'An unexpected error occurred.', current);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('retry-button').onclick = () => nav.goTo('connect');
    checkConnection();
  });
})();