import React, { useRef } from 'react'
import { getReplayData } from '../replay-parser'

export const ReplayPanel = ({ replayData, replayFrame, scores, autoplayEnabled, setAutoplayEnabled, setReplayData, setReplayFrame }) => {
  const inputRef = useRef()

  const isReplayFrameValid = (n) => {
    if (n < 0) return false;
    if (n > replayData.frames.length) return false;
    return true;
  }

  const diffReplayFrame = (i) => {
    const newFrames = replayFrame + i;
    if (isReplayFrameValid(newFrames)) {
      setReplayFrame(newFrames);
    }
  }


  return (
    <div>
      <span className='caption'>Game url or id</span> <br />
      <input ref={inputRef} style={{ width: 400 }} /> <span>&nbsp;&nbsp;</span>
      <button onClick={async () => {
        const data = await getReplayData(inputRef.current.value)

        setReplayFrame(0);
        setReplayData(data);
        setAutoplayEnabled(false);
      }}>Load</button>
      {
        replayData ? <div style={{ marginTop: 12 }}>
          <button onClick={() => diffReplayFrame(-1)}>-1</button>
          <span>&nbsp;&nbsp;</span>
          <input value={replayFrame} onChange={(v) => {
            try {
              const value = parseInt(v.target.value.length === 0 ? '0' : v.target.value);
              if (!isNaN(value) && isReplayFrameValid(value)) {
                setReplayFrame(value)
              }
            }
            catch (e) { }
          }} style={{ width: 60 }} />
          <span>&nbsp;&nbsp;</span>
          <button onClick={() => diffReplayFrame(1)}>+1</button>
          <span className='caption'>
            &nbsp; &nbsp; Frames: {replayData.frames.length} &nbsp; &nbsp;
          </span>
          <button onClick={() => {
            setAutoplayEnabled(!autoplayEnabled)
          }}>{autoplayEnabled ? 'Pause' : 'Play'}</button> &nbsp;
          <button onClick={() => {
            setReplayFrame(0);
          }}>{'Start'}</button> &nbsp;
          <button onClick={() => {
            setReplayFrame(replayData.frames.length);
          }}>{'End'}</button> &nbsp;
          <button onClick={() => {
            setReplayData(null);
            setReplayFrame(null);
            setAutoplayEnabled(false);
          }}>Clear</button> <br /> <br />
          <button onClick={() => {
            setReplayData({
              ...replayData,
              playerTeamId: replayData.result
                .find((v) => v.team_id !== replayData.playerTeamId)?.team_id ?? replayData.playerTeamId
            })
          }}>Swap targeted player</button> <br />
          <span className='caption'>
            {replayData.result.map((v) => {
              if (v.team_id === replayData.playerTeamId) {
                return <span style={{ color: '#619bfa' }}>{v.username}: {scores[v.team_id]} &nbsp; </span>
              }

              return <span style={{ color: '#60a75b' }}>{v.username}: {scores[v.team_id]} &nbsp;</span>
            })}
          </span>
        </div> : null
      }
    </div >
  )
}