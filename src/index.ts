import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import app from './app';

const port = app.get('port');
app.listen(port, () => {
    console.log(`server live, port="${port}", env="${app.get('env')}", ctrl-c to kill`);
});
