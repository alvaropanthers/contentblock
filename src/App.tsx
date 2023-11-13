/* global chrome */
import { useEffect, useState } from 'react';

import { Button, Grid, IconButton, Paper, Stack, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import BlockIcon from '@mui/icons-material/Block';
import ErrorIcon from '@mui/icons-material/Error';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';

import { validURL } from './utils';
import './App.css';

enum VIEWS { MAIN, HTML };

function BlockedItem(props: { uri: string; onClick: any; }) {
    return (
        <Paper 
            style={{ padding: '5px' }}>
            <Grid container wrap="wrap">
                <Grid item xs={1} textAlign={'center'}>
                    <BlockIcon 
                        style={{ 
                            fontSize: '18px',
                            color: 'rgb(211, 47, 47)',
                            marginRight: '5px',
                            position: 'relative',
                            top: '5px'
                        }} 
                    />
                </Grid>
                <Grid item xs={10}>
                    <Typography style={{ 
                        fontSize: '18px',
                        wordWrap: 'break-word'
                    }}>{ props.uri }</Typography>
                </Grid>
                <Grid item xs={1} textAlign={'center'}>
                    <IconButton 
                        size='small'
                        onClick={() => props.onClick(props.uri)}
                    >
                        <DeleteIcon 
                            style={{ 
                                fontSize: '18px',
                            }} 
                        />
                    </IconButton>
                </Grid>
            </Grid>
        </Paper>
    );
}

function App() {
    const [websites, setWebsites] = useState<string[]>([]);
    const [inputText, setInputText] = useState("");
    const [error, setError] = useState(false);
    const [currentView, setCurrentView] = useState(VIEWS.MAIN);
    const [html, setHtml] = useState("");

    useEffect(() => {
        if (chrome.storage) {
            chrome.storage.local.get(["websites", "html"])
            .then((value: any) => {
                if (value && value.websites)
                    setWebsites(value.websites);

                if (value && value.html)
                    setHtml(value.html);
            })
            .catch((error) => console.log(error));
        }
    }, []);

    const addWebsite = (website: string) => {
        const newArr = [...websites, website];
        addToStorage('websites', newArr)
        .then((value: any) => {
            setWebsites(newArr);
        })
        .catch((error) => console.log(error))
        .finally(() => {
            setWebsites(newArr);
        });
    }

    const removeWebsite = (website: string) => {
        const newArr = websites.filter((value: string) => value !== website);
        addToStorage('websites', newArr)
        .then((value: any) => {
            setWebsites(newArr);
        })
        .catch((error) => console.log(error))
        .finally(() => {
            setWebsites(newArr);
        });           
    }

    const addToStorage = async (key: string, value: any, callBack?: any) => {
        if (chrome.storage) {
            try {
                const response = await chrome.storage.local.set({ [key]: value });
                return response;
            } catch (error) {
                return error;
            }
        } 

        return false;
    }
    
    const handleFormSubmit = (e: any) => {
        e.preventDefault();

        if (inputText !== "" 
            && validURL(inputText)
            && !websites.includes(inputText)) {
                const formattedWebsite = inputText
                .replace('https', '')
                .replace('https://', '')
                .replace('www.', '');

            addWebsite(formattedWebsite)
            setInputText("");
        }
    }

    const handleInputOnChange = (event: any) => {
        const str = event.target.value;

        if (!validURL(str)) {
            setError(true);
        } else {
            setError(false);
        }

        setInputText(str);
    }

    return (
        <div className="app">
            <div style={{ 
                backgroundColor: '#1976d2',
                textAlign: 'right',
                marginBottom: '10px',
            }}>
                <IconButton
                    onClick={() => {
                        if (currentView === VIEWS.MAIN) {
                            setCurrentView(VIEWS.HTML);
                        } else {
                            setCurrentView(VIEWS.MAIN);
                        }
                    }}
                    style={{ color: 'white' }}
                >
                    <SettingsApplicationsIcon 
                        style={{
                            fontSize: '34px'
                        }}
                    />
                </IconButton>
            </div>

            { currentView === VIEWS.HTML && (
                <Paper style={{ padding: '10px' }}>
                    <form onSubmit={(e: any) => {
                        e.preventDefault();
                        if (html !== "")
                            addToStorage('html', html)
                            .then(() => {
                                setHtml("");
                            })
                            .catch((error) => console.log(error));
                    }}>
                        <TextField
                            multiline
                            fullWidth
                            rows={4}
                            label="HTML"
                            placeholder="HTML..."
                            value={html}
                            onChange={(e: any) => setHtml(e.target.value)}
                        />
                        <Button 
                            fullWidth
                            disableElevation
                            type='submit'
                            variant='contained' 
                        >Enter</Button>
                    </form>
                </Paper>
            )}

            { currentView === VIEWS.MAIN && (
                <div style={{ padding: '10px' }}>
                    <Paper
                        className="main-size websites-container"
                        style={{ 
                            overflowY: 'auto', 
                            marginBottom: '10px',
                            // borderBottomLeftRadius: '0px', 
                            // borderBottomRightRadius: '0px' 
                        }}
                        elevation={2}
                    >
                        <Stack spacing={2} margin={2}>
                            { websites.length === 0 && (
                                <div style={{ 
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    textAlign: 'center', 
                                    height: '160px' 
                                }}>
                                    <BlockIcon style={{ color: 'rgb(211, 47, 47)', fontSize: '40px', marginBottom: '10px'}} />
                                    <Typography>Enter a website to begin blocking</Typography>
                                </div>
                            )}
                            { websites.map((value: string, index: number) => <BlockedItem key={index} uri={value} onClick={removeWebsite} />) }
                        </Stack>
                    </Paper>
                    <div className="main-size">
                        <form onSubmit={handleFormSubmit} style={{ textAlign: 'right'}}>
                            <TextField 
                                required
                                fullWidth
                                label="Website" 
                                variant="outlined" 
                                value={inputText}
                                onChange={handleInputOnChange}
                                size='medium'
                                error={error}
                                style={{ backgroundColor: 'white' }}
                                InputProps={{
                                    endAdornment: (
                                        error ? (
                                            <ErrorIcon 
                                            style={{ color: 'rgb(211, 47, 47)' }}
                                            />
                                        ): (<span />)
                                    )
                                }}
                            />
                            <Button 
                                type="submit"
                                variant="contained" 
                                endIcon={<SendIcon />} 
                                // disableElevation
                                style={{ 
                                    marginTop: '5px'
                                    // borderTopLeftRadius: '0px', 
                                    // borderTopRightRadius: '0px' 
                                }}
                            >
                                Add
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;