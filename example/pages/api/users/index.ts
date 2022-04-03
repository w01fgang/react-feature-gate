import { NextApiRequest, NextApiResponse } from 'next'
import { sampleUserData } from '../../../utils/sample-data'

const handler = (_req: NextApiRequest, res: NextApiResponse): void => {
  res.status(200).json(sampleUserData)
}

export default handler
